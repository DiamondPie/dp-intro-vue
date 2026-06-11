<template>
  <div class="friend-invite">
    <div class="friend-invite-glow"/>

    <div class="friend-invite-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
        />
      </svg>
    </div>

    <div class="friend-invite-text">
      <h3>{{ $t('friends.invite_heading') }}</h3>
      <p>{{ $t('friends.invite_text') }}</p>
      <p>
        <i18n-t keypath="friends.invite_contact" tag="span" scope="global">
          <template #email>
            <a @click="openMail">{{ $t('friends.invite_email') }}</a>
          </template>
        </i18n-t>
      </p>
    </div>

    <a
      class="friend-invite-btn"
      href="https://forms.gle/AimX3Wq8mefvJ5Bi8"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M14 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9l-7-7zm5 16H5V5h8v5h5v9zM9 13h6v2H9v-2zm0-3h6v2H9v-2zm0 6h4v2H9v-2z"
        />
      </svg>
      {{ $t('friends.invite_btn') }}
    </a>
  </div>
</template>

<script setup>
function openMail() {
  if (typeof window !== 'undefined' && typeof window.openMailClient === 'function') {
    window.openMailClient()
  }
}
</script>

<style scoped>
.friend-invite {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--accent-primary), transparent 92%),
    rgba(233, 160, 255, 0.08)
  );
  position: relative;
  overflow: hidden;
}

.friend-invite-glow {
  position: absolute;
  top: -60px;
  right: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(233, 160, 255, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.friend-invite-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: color-mix(in oklab, var(--accent-primary), transparent 90%);
  border: 1px solid color-mix(in oklab, var(--accent-primary), transparent 70%);
}

.friend-invite-icon svg {
  width: 22px;
  height: 22px;
  fill: color-mix(in oklab, var(--accent-primary), transparent 10%);
}

.friend-invite-text {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.friend-invite-text h3 {
  margin: 0 0 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.friend-invite-text p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-gray-400);
  line-height: 1.5;
}

.friend-invite-text a {
  text-decoration: underline;
  cursor: pointer;
}

.friend-invite-btn {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid color-mix(in oklab, var(--color-cyan), transparent 35%);
  background: color-mix(in oklab, var(--color-cyan), transparent 85%);
  color: var(--color-cyan);
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}

.friend-invite-btn:hover {
  background: color-mix(in oklab, var(--color-cyan), transparent 72%);
  transform: scale(1.05);
}

.friend-invite-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

@media (max-width: 540px) {
  .friend-invite {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>