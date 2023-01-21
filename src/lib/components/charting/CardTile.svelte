<!-- outer div, accepts class overrides from parent -->
<div class="border rounded-md p-2 {$$restProps.class}">
	<!-- Inner div, sets layout of tile. Not editable from parent -->
	<div class="w-full h-full flex flex-col">
		<!-- <div class="">
            Hello
        </div>
        <div class="">
            Hello
        </div>
        <div class="">
            Hello
        </div> -->
		<div
			class="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border"
		>
			<div class="flex-auto p-4">
				<div class="flex flex-row -mx-3">
					<div class="flex-none w-2/3 max-w-full px-3">
						<div>
							<p
								class="mb-0 font-sans font-semibold leading-normal uppercase dark:text-white dark:opacity-60 text-sm"
							>
								Today's Money
							</p>
							<h5 class="mb-2 font-bold dark:text-white">$53,000</h5>
							<p class="mb-0 dark:text-white dark:opacity-60">
								<span class="font-bold leading-normal text-sm text-emerald-500">+55%</span>
								since yesterday
							</p>
						</div>
					</div>
					<div class="px-3 text-right basis-1/3">
						<div
							class="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500"
						>
							<i class="ni ni-money-coins text-lg relative top-3.5 text-white" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
