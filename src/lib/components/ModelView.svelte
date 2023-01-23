<script>
    
    import AgGrid from "$lib/components/AgGrid.svelte";

    import OntologyData from "../data/ontology.json"
    // import LocationsData from "../data/agGrid_Locations.json"
    // import EquipmentData from "../data/agGrid_Equipment.json"
    // import CollectionsData from "../data/agGrid_Collections.json"

    // // EXTRAS
    // import LocEquipData from "../data/agGrid_Locations_and_Equip.json"

    import { entityTrees } from '$lib/stores/TreeGridDataStore'
    // console.log(entityTrees)


	import { onMount } from "svelte";
    

    const PREFIXES = {
        "https://brickschema.org/schema/Brick": "brick",
        "https://switchautomation.com/schemas/BrickExtension": "switch"
    }

    //
    // Make imported JSON accessible
    //
    let ontologyData = OntologyData;

    $: active_data = $entityTrees[page] 
    // $: console.debug("Active Data", active_data)

    //
    // PROCESS DATA FOR ONTOLOGY FILTERING
    //

    // class set in building
    let class_set = new Set($entityTrees.Equipment.map(row => row.class))
    let location_class_set = new Set($entityTrees.Location.map(row => row.class))
    let collection_class_set = new Set($entityTrees.Collection.map(row => row.class))
    let metering_class_set = new Set($entityTrees.Meter.map(row => row.class));

    // Get full paths for all classes, expand into set of classes we need to display
    // We are doing this because it means the full data object is put into the row, not just a 'filler' item for classes on the path
    // https://www.ag-grid.com/javascript-data-grid/tree-data/#filler-groups
    // let class_all_paths_set = new Set( ontologyData.filter(row => class_set.has(row.uri)).map(row => row.path.full).flat() )
    let class_all_paths_set = getFullClassSet(ontologyData, class_set)
    let location_class_all_paths_set = getFullClassSet(ontologyData, location_class_set)
    let collection_class_all_paths_set = getFullClassSet(ontologyData, collection_class_set)
    let metering_class_all_paths_set = getFullClassSet(ontologyData, metering_class_set)


    function getFullClassSet(ontology, class_set){
        // given an ontology file, extract all classes that are present in the paths for the class_set
        // flatten these into one array
        const all_classes = ontology.filter(row => class_set.has(row.uri)).map(row => row.path.full).flat()
        return new Set( all_classes )
    }
    



    //
    // ONTOLOGY DATA FILTERING
    //
    // Create dynamic variable to hold the current set to filter the ontology to
    let classFilterSet = class_all_paths_set // for ontology grid
    
    // Reactive variable holding filtered ontology that updates when building model view selection does (via the filter set)
    $: ont_data = ontologyData.filter((row) => {return classFilterSet.has(row.uri)})

    //
    // GRID APIS
    //

    let api;
    let treeApi;
    let locationsApi;

    let gridApis = {
        Ontology: null,
        Equipment: null,
        Location: null,
        Collection: null,
        View: null // One viewer grid, instead of cycling APIs I can cycle data.
    }

    // Variable to hold the 'active' viewer grid api
    // let activeGridApi = api

    // PAGE HANDLING
    let page = "Equipment"


    // This DOES NOT WORK - not sure why?
    function changePage(new_page, new_filter_set){
        // new_filter_set filters the ontology panel to just show classes on the page

        // Update page variable
        page = new_page
        
        // Clear current User filters from Ontology Grid
        gridApis.Ontology.setFilterModel(null)
        // Update ontology filter class set
        classFilterSet = new_filter_set; 
        // Refresh ontology grid to show changes
        gridApis.Ontology.onFilterChanged()
    }

    // DEBUG
    $: {
        // console.log(treeApi)
        // console.debug(class_all_paths_set, location_class_all_paths_set)
        // console.log(ontologyData)
        // console.log(ont_data)
    }

    //
    // MAIN GRID FILTERS
    //

    let filterClasses = [] // for main grid


    // Function to set the 'class' SET type filter on main grid
    function setClassFilter(grid_api, itemsToFilter){
        try {
            const filterInstance = grid_api.getFilterInstance('class');
            // console.log(grid_api)
            // console.log(filterInstance)
            // Get Set filter
            const setFilter = filterInstance.filters.filter(filter => filter.filterNameKey == "setFilter")[0]
            // console.log(setFilter, grid_api)
            if (itemsToFilter.length==0){
                setFilter.resetFilterValues()
                setFilter.setModel(null)
                grid_api.onFilterChanged()
            } else {
                setFilter.setModel({ values: itemsToFilter }).then(function() { grid_api.onFilterChanged(); });
            }
        } catch {
            console.log('Grid not ready to filter')
        }
    }

    // Call the filter everytime the filter list changes
    $: {
        setClassFilter(gridApis.View, filterClasses)
    }



    //
    // GRID CONFIGS
    //

    let columnDefs = [
        { headerName: "Label", field: "label", colId: "labelCol", filter: 'agTextColumnFilter'},
        {
            headerName: "Class",
            field: "class",
            sortable: true,
            editable: true,
            cellRenderer: nodeGetter,
            filter:'agMultiColumnFilter',
            filterParams: {
                buttons: ['clear']
            },
            filterValueGetter: classFilterValueGetter 
            
        },
        { headerName: "Ontology", field: "class", cellRenderer: ontologyGetter },
        { headerName: "Subject", field: "subject", sortable: true },
    ];

    let ontologyColumnDefs = [
        // { headerName: "Term", field: "term", sortable: true }
    ]

    // let options = {
    //     treeData: true,
    //     getDataPath: getDataPath,
    //     autoGroupColumnDef: {
    //             headerName: "Entity",
    //             width: 300,
    //             sortable: true,
    //             // comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
    //             //     if (nodeA.groupData == nodeB.groupData) return 0;
    //             //     return (nodeA.groupData > nodeB.groupData) ? 1 : -1;
    //             // },
    //             cellRendererParams: {
    //                 suppressCount: true,
    //                 innerRenderer: labelGetter
    //             },
    //             // filter: 'agTextColumnFilter',
    //             resizable: true
    //     },
    //     defaultColDef: {
    //         sortable: true,
    //         flex: 1,
    //         resizable: true,
    //         floatingFilter: true
    //     },
    //     sideBar: {
    //         toolPanels: ['filters'],
    //         defaultToolPanel: null
    //     }
    // }

    // NEW OPTIONS - going to replace 'options' with this;
    // This has a new path function to match an update JSON format; I need to convert the Equipment Data to use new JSON format first
    let newOptions = {
        treeData: true,
        getDataPath: (data) => { return data.path },
        autoGroupColumnDef: {
                headerName: "Entity",
                width: 300,
                sortable: true,
                // comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                //     if (nodeA.groupData == nodeB.groupData) return 0;
                //     return (nodeA.groupData > nodeB.groupData) ? 1 : -1;
                // },
                cellRendererParams: {
                    suppressCount: true,
                    innerRenderer: labelGetter
                },
                // filter: 'agTextColumnFilter',
                resizable: true
        },
        defaultColDef: {
            sortable: true,
            flex: 1,
            resizable: true,
            floatingFilter: true
        },
        sideBar: {
            toolPanels: ['filters'],
            defaultToolPanel: null
        }
    }

    // Setup for Ontology Browser grid
    let ontologyGridOptions = {
        treeData: true,
        getDataPath: (data) => {
            if (data.path.full[0] == "https://brickschema.org/schema/Brick#Class"){
                // This is how I used to filter the grid; this is not dynamic.
                // I am going to move this filtering into an 'externalfilter'
                // if (classFilterSet.has(data.uri)){
                //     return data.path.full.slice(1)
                // } else {
                //     return null
                // }
                return data.path.full.slice(1)
            }
            else {
                return null
            }
        },
        autoGroupColumnDef: {
            headerName: "Class",
            // width: 100,
            sortable: true,
            // comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
            //     if (nodeA.groupData == nodeB.groupData) return 0;
            //     return (nodeA.groupData > nodeB.groupData) ? 1 : -1;
            // },
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: classValueGetter
            },
            filter: 'agTextColumnFilter',
            resizable: true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true
        },
        defaultColDef: {
            sortable: true,
            flex: 1,
            resizable: true
        },
        rowSelection:'multiple',
        rowData: null,
        groupSelectsChildren: true,
        // This does not work as it only does each row, not the children.
        // isExternalFilterPresent: (params) => {console.debug("Filter Set: ", classFilterSet); return true},
        // doesExternalFilterPass: ontologyExternalFilterFunc
    }

    function rowChangeTest(event) {
        filterClasses = event.detail.map(row => row.term)
    }

    // function ontologyExternalFilterFunc(row){
    //     // debug
    //     if(classFilterSet.has(row.data.uri)){
    //         console.debug("Row Value: ", row.data.uri)
    //     }
    //     return classFilterSet.has(row.data.uri)
    // }

    // function getDataPath(data) {
    //     const raw = data.path.split("</>"); // this should help with duplicates. Will then use a formatter function to display term only.

    //     return raw
    // }

    function labelGetter(params) {
        try {
            return params.data.label
        } catch {
            console.debug("label error: ", params)
        }
    }

    function nodeGetter(params){
        try {
            return params.value.split("#").pop()
        } catch {
            console.debug("node error: ", params)
        }
    }

    function classFilterValueGetter(params){
        return params.data.class.split("#").pop()
    }

    function ontologyGetter(params){
        try {
            const ont = params.value.split("#")[0]
            const prefix = PREFIXES[ont]
            return prefix ? prefix : ont
        } catch {
            return params.value
        }

    }

    function classValueGetter(params) {
        // SET ICON
        let icon = "❔" //🧱 🟢 ❔
        try {
            if(params.data.prefix == "brick") {
                icon = "🧱"
            } else if (params.data.prefix == "switch") {
                icon = "🟢"
            } else if (params.data.prefix == "owl") {
                icon = "🦉"
            }
        } catch(e) {
            console.log(`Grid::Class: No icon for given namespace of: ${params.value}`)
        }
        // SET NAME (TERM)
        try {
            return `${params.data.term} &nbsp; ${icon}`
        } catch {
            console.log(`Grid::Class: No term available for: ${params.value}`)
            return `${params.value} &nbsp; ${icon}`
        }
    }

    // GRID CONTROL
    function onFilterTextBoxChanged(api) {
        api.setQuickFilter(
            document.getElementById('filter-text-box').value
        );
        api.expandAll();
    }

    function onTreeFilterTextBoxChanged() {
        gridApis.Ontology.setQuickFilter(
            document.getElementById('tree-filter-text-box').value
        );
        gridApis.Ontology.expandAll();
    }

    function collapseRows(grid_api) {
        grid_api.collapseAll();
    }

    function expandRows(grid_api) {
        grid_api.expandAll();
    }



</script>

<style>
</style>

<div class="h-full w-full flex flex-row overflow-y-hidden">
    <div id="ontology-browser" class="w-1/5 h-full flex flex-col">
        <div id="filler_r1" class="flex my-2">
            <button class="border border-white font-bold py-1 px-1 rounded cursor-default pl-2">Model Tree Viewer</button>
        </div>
        <div id="controller-bar" class="flex flex-row space-x-2 my-2 px-2 w-full">
            <button class="border border-blue-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded" on:click={expandRows(gridApis.Ontology)}>
                <pre> + </pre>
            </button>
            <button class="border border-slate-500 bg-slate-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded" on:click={collapseRows(gridApis.Ontology)}>
                <pre> - </pre>
            </button>
            <div class="border rounded border-blue-500 flex-grow">
                <input class="w-full" type="search" id="tree-filter-text-box" placeholder="Filter..." on:input={onTreeFilterTextBoxChanged}>
            </div>
        </div>
        <AgGrid bind:api={gridApis.Ontology} bind:data={ont_data} columnDefs={ontologyColumnDefs} options={ontologyGridOptions} on:select={rowChangeTest}/>
    </div>

    <div id="building-browser" class="w-4/5 h-full flex flex-col">
        <div id="controller-bar" class="flex flex-row w-full my-2 px-2 justify-between">
            <div class="flex flex-row space-x-2 flex-grow">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded" on:click={expandRows(gridApis.View)}>
                    Expand All
                </button>
                <button class="bg-slate-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded" on:click={collapseRows(gridApis.View)}>
                    Collapse All
                </button>
                <div class="border rounded w-1/3 border-blue-500">
                    <input class="w-full" type="search" id="filter-text-box" placeholder="Filter..." on:input={onFilterTextBoxChanged(gridApis.View)}>
                </div>
            </div>
            <div>
                <form action="../">
					<button type="submit" class="border rounded-md border-teal-800 p-1 bg-teal-500 text-white font-bold">Back to Upload</button>
				</form>
            </div>
        </div>
        <div id="page-selector" class="flex flex-row space-x-2 w-full my-2 px-2">
            <button class="border border-blue-500 hover:bg-blue-700 hover:text-white text-blue-500 font-bold py-1 px-1 rounded" class:active-btn={page=="Equipment"} on:click={() => { setClassFilter(gridApis.View, []); page="Equipment"; classFilterSet=class_all_paths_set; gridApis.Ontology.onFilterChanged() }}>
                Equipment
            </button>
            <button class="border border-blue-500 hover:bg-blue-700 hover:text-white text-blue-500 font-bold py-1 px-1 rounded" class:active-btn={page=="Location"} on:click={() => { setClassFilter(gridApis.View, []); page="Location"; classFilterSet=location_class_all_paths_set; gridApis.Ontology.onFilterChanged() }}>
                Location
            </button>
            <button class="border border-blue-500 hover:bg-blue-700 hover:text-white text-blue-500 font-bold py-1 px-1 rounded" class:active-btn={page=="Collection"} on:click={() => { setClassFilter(gridApis.View, []); page="Collection"; classFilterSet=collection_class_all_paths_set; gridApis.Ontology.onFilterChanged() }}>
                Collection
            </button>
            <div class="left-1/2 ml-0.5 w-0.5 bg-gray-600">
            </div>
            <button class="border border-sky-500 hover:bg-sky-700 hover:text-white text-sky-500 font-bold py-1 px-1 rounded" class:active-btn={page=="Meter"} on:click={() => { setClassFilter(gridApis.View, []); page="Meter"; classFilterSet=metering_class_all_paths_set; gridApis.Ontology.onFilterChanged() }}>
                Meters
            </button>
        </div>
        <AgGrid bind:api={gridApis.View} bind:data={active_data} columnDefs={columnDefs} options={newOptions}/>

    </div>

</div>
