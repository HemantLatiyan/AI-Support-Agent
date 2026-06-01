<script lang="ts">
	import chatbot from '$lib/assets/chatbot.png';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={chatbot} />
</svelte:head>

{@render children()}
