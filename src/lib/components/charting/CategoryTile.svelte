<script>
    export let Total = 0
    export let Equipment = 0
    export let Location = 0
    export let Collection = 0
    export let Point = 0

    function calcPercentageStr(value){
        // div 0 and bad data guard clause
        if(Total <= 0){
            return "N/A"
        }
        return (value/Total * 100).toFixed(2)
    }
</script>

<div
	class="border rounded-md relative flex min-w-0 flex-col break-words bg-white"
>
<!-- class="border-black/12.5 shadow-xl dark:bg-slate-850 dark:shadow-dark-xl relative flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border" -->


	<div class="p-4 pb-0 rounded-t-4">
		<h6 class="mb-0 dark:text-white">Categories</h6>
	</div>
	<div class="flex-auto p-4">
		<ul class="flex flex-col pl-0 mb-0 rounded-lg">
			<li
				class="relative flex justify-between py-2 pr-4 mb-2 border-0 rounded-t-lg rounded-xl text-inherit"
			>
				<div class="flex items-center">
					<div
						class="inline-block w-8 h-8 mr-4 text-center text-black bg-center shadow-sm fill-current stroke-none bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 rounded-xl"
					>
						<i class="text-white ni ni-mobile-button relative top-0.75 text-xxs" />
					</div>
					<div class="flex flex-col">
						<span class="leading-tight dark:text-white/80 text-normal">
                            <span class="font-semibold">{Total}</span>
                        </span>
						<h6 class="leading-normal text-sm text-slate-700 dark:text-white">Total Entities</h6>
					</div>
				</div>
				<div class="flex">
					<button
						class="group ease-in leading-pro text-xs rounded-3.5xl p-1.2 h-6.5 w-6.5 mx-0 my-auto inline-block cursor-pointer border-0 bg-transparent text-center align-middle font-bold text-slate-700 shadow-none transition-all dark:text-white"
						><i
							class="ni ease-bounce text-2xs group-hover:translate-x-1.25 ni-bold-right transition-all duration-200"
							aria-hidden="true"
						/></button
					>
				</div>
			</li>
            <li
				class="relative flex justify-between py-2 pr-4 mb-2 border-0 rounded-t-lg rounded-xl text-inherit"
			>
				<div class="flex items-center">
					<div
						class="inline-block w-8 h-8 mr-4 text-center text-black bg-center shadow-sm fill-current stroke-none bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 rounded-xl"
					>
						<i class="text-white ni ni-mobile-button relative top-0.75 text-xxs" />
					</div>
					<div class="flex flex-col">
                        <span class="leading-tight dark:text-white/80 text-normal">
                            <span class="font-semibold">{Equipment}</span>
                            <span class="text-sm">({calcPercentageStr(Equipment)}%)</span>
                        </span>
						<h6 class="leading-normal text-sm text-slate-700 dark:text-white">Equipment</h6>
					</div>
				</div>
				<div class="flex">
					<button
						class="group ease-in leading-pro text-xs rounded-3.5xl p-1.2 h-6.5 w-6.5 mx-0 my-auto inline-block cursor-pointer border-0 bg-transparent text-center align-middle font-bold text-slate-700 shadow-none transition-all dark:text-white"
						><i
							class="ni ease-bounce text-2xs group-hover:translate-x-1.25 ni-bold-right transition-all duration-200"
							aria-hidden="true"
						/></button
					>
				</div>
			</li>
			<li class="relative flex justify-between py-2 pr-4 mb-2 border-0 rounded-xl text-inherit">
				<div class="flex items-center">
					<div
						class="inline-block w-8 h-8 mr-4 text-center text-black bg-center shadow-sm fill-current stroke-none bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 rounded-xl"
					>
						<i class="text-white ni ni-tag relative top-0.75 text-xxs" />
					</div>
					<div class="flex flex-col">
						<span class="leading-tight dark:text-white/80 text-normal">
                            <span class="font-semibold">{Collection}</span>
                            <span class="text-sm">({calcPercentageStr(Collection)}%)</span>
                        </span>
						<h6 class="leading-normal text-sm text-slate-700 dark:text-white">Collections</h6>
					</div>
				</div>
				<div class="flex">
					<button
						class="group ease-in leading-pro text-xs rounded-3.5xl p-1.2 h-6.5 w-6.5 mx-0 my-auto inline-block cursor-pointer border-0 bg-transparent text-center align-middle font-bold text-slate-700 shadow-none transition-all dark:text-white"
						><i
							class="ni ease-bounce text-2xs group-hover:translate-x-1.25 ni-bold-right transition-all duration-200"
							aria-hidden="true"
						/></button
					>
				</div>
			</li>
			<li
				class="relative flex justify-between py-2 pr-4 mb-2 border-0 rounded-b-lg rounded-xl text-inherit"
			>
				<div class="flex items-center">
					<div
						class="inline-block w-8 h-8 mr-4 text-center text-black bg-center shadow-sm fill-current stroke-none bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 rounded-xl"
					>
						<i class="text-white ni ni-box-2 relative top-0.75 text-xxs" />
					</div>
					<div class="flex flex-col">
						<span class="leading-tight dark:text-white/80 text-normal">
                            <span class="font-semibold">{Location}</span>
                            <span class="text-sm">({calcPercentageStr(Location)}%)</span>
                        </span>
						<h6 class="leading-normal text-sm text-slate-700 dark:text-white">Locations</h6>
					</div>
				</div>
				<div class="flex">
					<button
						class="group ease-in leading-pro text-xs rounded-3.5xl p-1.2 h-6.5 w-6.5 mx-0 my-auto inline-block cursor-pointer border-0 bg-transparent text-center align-middle font-bold text-slate-700 shadow-none transition-all dark:text-white"
						><i
							class="ni ease-bounce text-2xs group-hover:translate-x-1.25 ni-bold-right transition-all duration-200"
							aria-hidden="true"
						/></button
					>
				</div>
			</li>
			<li
				class="relative flex justify-between py-2 pr-4 border-0 rounded-b-lg rounded-xl text-inherit"
			>
				<div class="flex items-center">
					<div
						class="inline-block w-8 h-8 mr-4 text-center text-black bg-center shadow-sm fill-current stroke-none bg-gradient-to-tl from-zinc-800 to-zinc-700 dark:bg-gradient-to-tl dark:from-slate-750 dark:to-gray-850 rounded-xl"
					>
						<i class="text-white ni ni-satisfied relative top-0.75 text-xxs" />
					</div>
					<div class="flex flex-col">
						<span class="leading-tight dark:text-white/80 text-normal">
                            <span class="font-semibold">{Point}</span>
                            <span class="text-sm">({calcPercentageStr(Point)}%)</span>
                        </span>
						<h6 class="leading-normal text-sm text-slate-700 dark:text-white">Points</h6>
					</div>
				</div>
				<div class="flex">
					<button
						class="group ease-in leading-pro text-xs rounded-3.5xl p-1.2 h-6.5 w-6.5 mx-0 my-auto inline-block cursor-pointer border-0 bg-transparent text-center align-middle font-bold text-slate-700 shadow-none transition-all dark:text-white"
						><i
							class="ni ease-bounce text-2xs group-hover:translate-x-1.25 ni-bold-right transition-all duration-200"
							aria-hidden="true"
						/></button
					>
				</div>
			</li>
		</ul>
	</div>
</div>