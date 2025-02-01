<script lang='ts'>
    import kodiia_small from '$lib/logos/kodiia_small.svg';
</script>
<div class="nav-container">
    <nav>
        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
            <a href="https://kodiia.com">
                <img src={kodiia_small} style="border-radius: 0" height="30" alt="logo" />
            </a>
            <div style="display: flex; align-items: center;">
                <button
                    class="tertiaryButton"
                    onclick={() => {
                        window.open('/');
                    }}>About</button
                >
                <button
                    class="tertiaryButton"
                    onclick={() => {
                        window.open('/');
                    }}>Docs</button
                >
                <button
                    class="tertiaryButton"
                    onclick={() => {
                        window.open('/');
                    }}>Pricing</button
                >
                <button
                    class="tertiaryButton"
                    onclick={() => {
                        window.open('/blog', "_self");
                    }}>Blog</button
                >
                <button
                    class="primaryButton"
                    style="margin-left: 10px;"
                    onclick={() => {
                        window.open('/threads', '_self');
                    }}>Get started</button
                >
            </div>
        </div>
    </nav>
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
</style>