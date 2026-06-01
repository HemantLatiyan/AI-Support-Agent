<script lang="ts">
  import { onMount } from 'svelte';
  import { ChatStore } from '$lib/chat.svelte';
  import chatbotIcon from '$lib/assets/chatbot.png';
    
  const chat = new ChatStore();
  onMount(() => chat.init());
</script>

<div class="layout">
  <!-- Header -->
  <header>
    <div class="header-left">
      <div class="avatar">
        <img src={chatbotIcon} alt="ShopEasy" />
      </div>
      <div>
        <div class="agent-name">ShopEasy</div>
        <div class="agent-status">
          {#if chat.loading}
            <span class="typing">typing…</span>
          {:else}
            <span class="online">● Online</span>
          {/if}
        </div>
      </div>
    </div>
    <button class="new-chat-btn" onclick={() => chat.newChat()}>New chat</button>
  </header>

  <!-- Messages -->
  <div class="messages" bind:this={chat.messagesEl}>
    {#if chat.messages.length === 0}
      <div class="empty-state">
        <p>Hi there! How can I help you today?</p>
        <div class="suggestions">
          <button onclick={() => chat.suggest("What's your return policy?")}>Return policy</button>
          <button onclick={() => chat.suggest("Do you ship internationally?")}>Shipping info</button>
          <button onclick={() => chat.suggest("What are your support hours?")}>Support hours</button>
        </div>
      </div>
    {/if}

    {#each chat.messages as msg (msg.id)}
      <div class="message-row {msg.sender}">
        <div class="bubble">
          <p>{msg.text}</p>
          <span class="time">{chat.formatTime(msg.timestamp)}</span>
        </div>
      </div>
    {/each}

    {#if chat.loading}
      <div class="message-row ai">
        <div class="bubble typing-bubble">
          <span></span><span></span><span></span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Error -->
  {#if chat.error}
    <div class="error-bar">{chat.error}</div>
  {/if}

  <!-- Input -->
  <div class="input-area">
    <textarea
      rows="1"
      placeholder="Type a message…"
      bind:value={chat.input}
      onkeydown={(e) => chat.handleKeydown(e)}
      disabled={chat.loading}
    ></textarea>
    <button
      class="send-btn"
      onclick={() => chat.send()}
      disabled={chat.loading || !chat.input.trim()}
    >
      {#if chat.loading}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      {:else}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  @import './chat.css';
</style>
