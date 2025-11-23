<script>
	export let src = '/image/profile.jpeg';
	export let alt = 'Avatar';
	export let size = 'sm'; // sm, md, lg, xl

	// Size mappings
	const sizes = {
		sm: 'w-8 h-9 sm:w-12 sm:h-14',
		md: 'w-10 h-12 sm:w-16 sm:h-18',
		lg: 'w-14 h-16 sm:w-20 sm:h-24',
		xl: 'w-16 h-20 sm:w-28 sm:h-32',
		xxl: 'w-48 h-56 sm:w-48 sm:h-56'
	};

	const sizeClasses = sizes[size] || sizes.sm;
</script>

<div class="avatar">
	<div
		class={sizeClasses}
		style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"
	>
		<img {src} {alt} class="h-full w-full object-cover" />
	</div>
</div>
