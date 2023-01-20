<script>
    import Highcharts from 'highcharts'

    export let options;

    function GenerateHighchart(node, options){
        const chart = Highcharts.chart(node, options)
        return {
            destroy() {
                chart.destroy()
            }
        }
    }
</script>

{#key options}
    <div use:GenerateHighchart={options}></div>
{/key}