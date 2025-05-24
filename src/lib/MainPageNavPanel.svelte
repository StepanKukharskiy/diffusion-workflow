<script lang='ts'>
    import kodiia_small from '$lib/logos/kodiia_small.svg';
    import { slide } from 'svelte/transition';

    let isMenuOpen = $state(false);

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
</script>

<div class="nav-container">
    <nav>
        <div class="nav-content">
            <a href="https://kodiia.com">
                <img src={kodiia_small} style="border-radius: 0" height="30" alt="logo" />
            </a>
            <div class="desktop-menu">
                <button class="tertiaryButton" onclick={() => { window.open('/about', "_self"); }}>About</button>
                <button class="tertiaryButton" onclick={() => { window.open('/'); }}>Docs</button>
                <button class="tertiaryButton" onclick={() => { window.open('/'); }}>Pricing</button>
                <button class="tertiaryButton" onclick={() => { window.open('/blog', "_self"); }}>Blog</button>
                <button class="primaryButton" style="margin-left: 10px;" onclick={() => { window.open('/threads', '_self'); }}>Get started</button>
            </div>
            <button class="mobile-menu-icon" onclick={toggleMenu} aria-label='menu button'>
                &#9776; <!-- Hamburger icon -->
            </button>
        </div>
        
    </nav>
    {#if isMenuOpen}
            <div class="mobile-menu" transition:slide>
                <button class="tertiaryButton" onclick={() => { window.open('/about', "_self"); }}>About</button>
                <button class="tertiaryButton" onclick={() => { window.open('/'); }}>Docs</button>
                <button class="tertiaryButton" onclick={() => { window.open('/'); }}>Pricing</button>
                <button class="tertiaryButton" onclick={() => { window.open('/blog', "_self"); toggleMenu()}}>Blog</button>
                <button class="primaryButton" onclick={() => { window.open('/threads', '_self'); toggleMenu() }}>Get started</button>
            </div>
        {/if}
</div>

<style>
    .nav-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99;
    }
    nav {
        min-height: 40px;
        width: calc(100% - 20px);
        max-width: 1200px;
        box-sizing: border-box;
        border-radius: 10px;
        background: #fdfdfd;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        padding: 10px;
        margin: 10px;
        box-shadow: 0 0 10px hsl(0, 0%, 70%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 99;
    }
    .nav-content {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .desktop-menu {
        display: flex;
        align-items: center;
    }
    .mobile-menu-icon {
        display: none;
        cursor: pointer;
        font-size: 24px;
        background: none;
        border: none;
        color: hsl(0, 0%, 10%);
    }
    .mobile-menu {
        display: none;
        position: fixed;
        top: 75px;
        left: 0;
        margin: 0 10px;
        width: calc(100% - 20px);
        height: calc(100vh - 85px);
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
        flex-direction: column;
        align-items: center;
        border-radius: 10px;
		box-shadow: 0 0 10px hsl(0, 0%, 70%);
		z-index: 10;
    }
    .mobile-menu button {
        margin: 10px 0;
    }
    @media (max-width: 768px) {
        .desktop-menu {
            display: none;
        }
        .mobile-menu-icon {
            display: block;
        }
        .mobile-menu {
            display: flex;
        }
    }
</style>