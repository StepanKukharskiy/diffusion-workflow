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
    :global(.loader){
        displaY: block;
        width: 20px;
        height: 20px;
        margin: 10px;
        border: 2px solid;
        border-radius: 50%;
        border-color: #1a1a1a transparent;
        animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    }
</style>