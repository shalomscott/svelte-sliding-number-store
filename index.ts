import type { Writable } from 'svelte/store';

class SlidingNumber implements Writable<number> {
	private currentValue: number;
	private subscribers: Array<(value: number) => void> = [];
	private runningInterval: number | null = null;

	constructor(
		initialValue: number,
		private readonly duration:
			| number
			| ((from: number, to: number) => number) = 250,
		private readonly easing?: (t: number) => number,
		private readonly decimalPoints: number = 0
	) {
		this.currentValue = initialValue;
	}

	set(value: number): void {
		this.runningInterval && clearInterval(this.runningInterval);

		const duration =
			typeof this.duration === 'function'
				? this.duration(this.currentValue, value)
				: this.duration;
		const animationStep = duration / 9; // There are only 9 digits. Thus, this is our "resolution"

		const startDigits = this.getDigits(this.currentValue);
		const endDigits = this.getDigits(value);

		let step = 1;

		this.runningInterval = setInterval(() => {
			const currentDigits: number[] = [];
			for (let i = 0; i < Math.max(startDigits.length, endDigits.length); ++i) {
				currentDigits.push(
					this.interpolateDigit(
						startDigits[i] ?? 0,
						endDigits[i] ?? 0,
						step / 9
					)
				);
			}
			this.currentValue = this.compileDigits(currentDigits);
			this.subscribers.forEach((sub) => sub(this.currentValue));

			++step;

			if (step > 9) {
				clearInterval(this.runningInterval as number);
				this.runningInterval = null;
			}
		}, animationStep);
	}

	update(updater: (value: number) => number): void {
		this.set(updater(this.currentValue));
	}

	subscribe(run: (value: number) => void): () => void {
		const subIndex = this.subscribers.push(run) - 1;
		run(this.currentValue);
		return () => this.subscribers.splice(subIndex, 1);
	}

	private getDigits(value: number): number[] {
		const digits: number[] = [];
		const intLength = Math.trunc(value).toString().replace('-', '').length;

		for (let i = -this.decimalPoints; i < intLength; ++i) {
			digits.push(Math.trunc(value / Math.pow(10, i)) % 10);
		}

		return digits;
	}

	private compileDigits(digits: number[]): number {
		let compiled = 0;

		for (let i = 0; i < digits.length; ++i) {
			compiled += digits[i] * Math.pow(10, i - this.decimalPoints);
		}

		return compiled;
	}

	private interpolateDigit(start: number, end: number, t: number) {
		const easedTime = this.easing ? this.easing(t) : t;
		return Math.round(start + (end - start) * easedTime);
	}
}

export default function slidingNumber(
	value: number,
	{
		duration,
		easing,
		decimalPoints
	}: {
		duration?: number | ((from: number, to: number) => number);
		easing?: (t: number) => number;
		decimalPoints?: number;
	} = {}
) {
	return new SlidingNumber(value, duration, easing, decimalPoints);
}
