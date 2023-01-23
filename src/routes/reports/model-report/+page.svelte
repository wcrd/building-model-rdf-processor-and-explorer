<div class="h-screen flex flex-col">
    <a href="../../">Home</a>
    {#if data_loaded}
    <div class="grid grid-cols-3 grid-rows-3 gap-3 p-3 h-full">
        <!-- <div bind:this={chart} class="chart" use:GenerateHighchart={config}></div> -->
        <CategoryTile {...dataset.chart_categories}></CategoryTile>
        <Highchart options={bar_equipmentTypeCounts2} class="border rounded-md"></Highchart>
        <CardTile></CardTile>
        <Highchart options={barStack_classTypeByCore2} class="border rounded-md col-span-2"></Highchart>
        <!-- <CardTile></CardTile> -->
        <!-- <CardTile></CardTile> -->
        <!-- <Highchart options={demoOptions} class="border rounded-md"></Highchart> -->
        <!-- <Highchart options={demoOptions} class="border rounded-md"></Highchart> -->
        
    </div>
    {:else}
    <p>Data is loading. Please wait...</p>
    {/if}
</div>

<script>
    import { onMount } from "svelte";

    import Highchart from "$lib/components/charting/Highchart.svelte";
    import CardTile from "$lib/components/charting/CardTile.svelte"
    import CategoryTile from "$lib/components/charting/CategoryTile.svelte";

    import { dataset, generateData_TotalCounts, dataset_2, generateData_ClassSets } from "$lib/js/reporting/model_reporting";

    let data_loaded = false;

    onMount(() => {
        generateData_TotalCounts();
        console.log('Total Counts: ', dataset);
        generateData_ClassSets();
        console.log('Class Sets: ', dataset_2)
        data_loaded = true
    })
    //////////////////

    let demoOptions = {
            title: {
            text: 'Solar Employment Growth by Sector, 2010-2016'
        },

        subtitle: {
            text: 'Source: thesolarfoundation.com'
        },

        yAxis: {
            title: {
                text: 'Number of Employees'
            }
        },

        xAxis: {
            accessibility: {
                rangeDescription: 'Range: 2010 to 2017'
            }
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                pointStart: 2010
            }
        },

        series: [{
            name: 'Installation',
            data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
        }, {
            name: 'Manufacturing',
            data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
        }, {
            name: 'Sales & Distribution',
            data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
        }, {
            name: 'Project Development',
            data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
        }, {
            name: 'Other',
            data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
	};

    let bar_equipmentTypeCounts = {
        chart: {
            type: 'bar'
        },
        title: {
            text: "Entities by core class",
            align: "left"
        },
        xAxis: {
            categories: ['Equipment', 'Collections', 'Locations']
        },
        yAxis: {
            min: 0,
            title: {
                text: "Number of entities",
                align: "high"
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: 'Count',
            data: [300, 4, 15],
        }],
        legend: {
            enabled: false
        }
    }

    let bar_equipmentTypeCounts2 = {
        chart: {
            type: 'bar'
        },
        title: {
            text: "Entities by core class",
            align: "left"
        },
        xAxis: {
            categories: ['Equipment', 'Collections', 'Locations']
        },
        yAxis: {
            min: 0,
            title: {
                text: "Number of entities",
                align: "high"
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: 'Count',
            data: [dataset.chart_categories.Equipment, dataset.chart_categories.Collection, dataset.chart_categories.Location],
        }],
        legend: {
            enabled: false
        }
    }

    let barStack_classTypeByCore = {
        chart: {
            type: 'bar'
        },
        title: {
            text: "Entity Type distribution by core class",
            align: "left"
        },
        xAxis: {
            categories: ['Equipment', 'Collections', 'Locations']
        },
        yAxis: {
            min: 0,
            title: {
                text: "% of entities",
                align: "high"
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                },
                stacking: 'percent',
                colorByPoint: true
            },
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            name: 'Count',
            data: [
                {
                    name: "AHU",
                    x: 0,
                    y: 15
                },
                {
                    name: "FCU",
                    x:0,
                    y: 32
                },
                {
                    name: "VAV",
                    x:0,
                    y: 197
                },
                {
                    name: "Boiler",
                    x:0,
                    y: 3
                },
                {
                    name: "CHWS",
                    x: 1,
                    y: 1
                },
                {
                    name: "CDWS",
                    x: 1,
                    y: 1
                },
                {
                    name: "HHWS",
                    x: 1,
                    y: 1
                },
                {
                    name: "DHWS",
                    x: 1,
                    y: 1
                },
                {
                    name: "Office",
                    x: 2,
                    y: 4
                },
                {
                    name: "Level",
                    x: 2,
                    y: 71
                },
                {
                    name: "Roof",
                    x: 2,
                    y: 1
                },
                {
                    name: "Kitchen",
                    x: 2,
                    y: 2
                }
            ]
        }],
        legend: {
            enabled: false
        }
    }

    let barStack_classTypeByCore2 = {
        chart: {
            type: 'bar'
        },
        title: {
            text: "Entity Type distribution by core class",
            align: "left"
        },
        xAxis: {
            categories: Object.keys(dataset_2)
        },
        yAxis: {
            min: 0,
            title: {
                text: "% of entities",
                align: "high"
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                },
                stacking: 'percent',
                colorByPoint: true,
                // dataSorting: {
                //     enabled: true,
                //     sortKey: 'name'
                // },
            },
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    rotation: -45,
                    verticalAlign: 'top',
                    allowOverlap: false,
                    y: -5,
                    align: 'left',
                    crop: false
                },
                
            }
        },
        series: [{
            name: 'Count',
            data: Object.values(dataset_2).map((e,idx)=> {
                    return Object.entries(e).map(([k, v]) => {
                        return {
                            name: k.split("#").pop(),
                            x: idx,
                            y: v
                        }
                    })
                }).flat(),
        }],
        legend: {
            enabled: false
        },
        // dataSorting: {
        //     enabled: true,
        //     sortKey: '{point.name}'
        // }
    }

</script>


<!-- const chartData = [
  { timestamp: 1515059819853, value: 1, somethingElse: 'foo'},
  { timestamp: 1515059838069, value: 2, somethingElse: 'bar'},
  { timestamp: 1515059838080, value: 3, somethingElse: 'baz'},
  // you get the idea
]

const Chart = Highcharts.stockChart(myChart, {
  // ...options
  tooltip: {
    formatter () {
      // this.point.x is the timestamp in my original chartData array
      const pointData = chartData.find(row => row.timestamp === this.point.x)
      console.log(pointData.somethingElse)
    }
  },
  series: [{
      name: 'Numbers over the course of time',
      // restructure the data as an array as Highcharts expects it
      // array index 0 is the x value, index 1 is the y value in the chart
      data: chartData.map(row => [row.timestamp, row.value])
    }]
}) -->