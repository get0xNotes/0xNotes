<script lang="ts">
	export var addClass: String = "";
	export var isLoggedIn: Boolean = false
</script>

<header class="{addClass} flex p-3 px-6 w-full text-white bg-primarylight">
	<a class="my-auto flex" href="/">
		<img src="/logo.svg" alt="0xNotes" class="h-7 w-7 m-auto" />
		<span class="my-auto text-xl font-bold mx-2">0xNotes</span>
		<span class="bg-yellow-500 text-black rounded-full px-2">beta</span>
	</a>
	<div style="display: {isLoggedIn ? 'none' : 'block'}" class="ml-auto">
		<a href="/login">
			<button class="border-2 border-accent my-auto mx-1 px-3 py-2 text-sm rounded-md hover:scale-105">Login</button>
		</a>
		<a href="/signup">
			<button class="bg-accent my-auto mx-1 px-3 py-2 text-sm rounded-md hover:scale-105">Signup</button>
		</a>
	</div>
	<div style="display: {isLoggedIn ? 'block' : 'none'}" class="ml-auto">
		<a class="mx-2 text-sm" href="/dash">Dashboard</a>
		<a class="mx-1 text-sm" href="/account">Account</a>
	</div>
</header>
