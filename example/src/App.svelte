<script lang="ts">
	import { fly } from 'svelte/transition';
	import slidingNumber from '../../';

	const portfolio = slidingNumber(20000, { duration: 2000 });

	let up = true;
	$: color = up ? 'green' : 'red';
	$: emoji = up ? '🤑' : '😭';

	$: digits = $portfolio.toString();

	setInterval(() => {
		const change = randomPercentage();
		up = change > 0 ? true : false;
		$portfolio = $portfolio + $portfolio * change;
	}, 3000);

	function randomPercentage() {
		const negative = Math.random() > 0.6;
		return (Math.floor(Math.random() * 10) * (negative ? -1 : 1)) / 100;
	}
</script>

<style>
	p {
		font-family: monospace;
		font-size: 6rem;
	}
</style>

<h1>Stonks!</h1>
<p style="color: {color}">${$portfolio}</p>

{#each digits as digit}
	<p
		out:fly={{ duration: 200, x: 100 }}
		on:outroend
		in:fly={{ delay: 1000, duration: 200, x: -100 }}>
		{digit}
	</p>
{/each}

<p class="emoji">{emoji}</p>
