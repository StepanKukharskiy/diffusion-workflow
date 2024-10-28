<script>
    import { width, height, bgColor, textColor } from '$lib/store'
    import '../style.css'

     let innerWidth = $state()
     let innerHeight = $state()
     $effect(()=>{
        $width = innerWidth
        $height = innerHeight
     })
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<slot></slot>

<style>
    
</style>