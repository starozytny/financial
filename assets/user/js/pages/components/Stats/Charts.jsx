import React, { Component } from 'react';

import Chart from 'react-apexcharts';
import Sanitaze from "@commonComponents/functions/sanitaze";

export class ChartDay extends Component {
    constructor(props) {
        super(props);

        let data = [0, 0, 0];
        if(props.data){
            props.data.forEach(el => {
                data[el.type] += el.price;
            })
        }

        this.state = {
            series: data,
            options: {
                labels: ['Dépenses', 'Revenus', 'Economies'],
                colors: ['#f7685b', '#1e87f0', '#fdad2d'],
                tooltip: {
                    y: {
                        formatter: (val) => {
                            return Sanitaze.toFormatCurrency(val)
                        }
                    }
                }
            },
        };
    }

    render () {
        const { options, series } = this.state;

        return <Chart options={options} series={series} type="donut" height={280} />

    }
}