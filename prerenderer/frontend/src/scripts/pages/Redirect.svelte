<!-- Redirect page. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { mutate } from 'scripts/store';
  import Message from 'scripts/components/Message.svelte';

  const isPrerenderer = !!navigator.webdriver;
  const redirect = '/';
  onMount(() => {
    if (!isPrerenderer) {
      mutate('router', 'NAVIGATE', `${redirect}${window.location.search}`);
    }
  });
</script>

<Message
  label={`This page has been moved to ${redirect}${window.location.search}.`}
/>
<meta
  id="prerender"
  data-status="301"
  data-redirect={`${window.location.protocol}${window.location.host}${redirect}${window.location.search}`}
/>
