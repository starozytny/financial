import React, { Component } from "react";

import { Months } from "@dashboardComponents/Tools/Days";

export class Planning extends Component {
    constructor(props) {
        super(props);

        this.state = {
            monthActive: 1
        }

        this.handleSelectMonth = this.handleSelectMonth.bind(this);
    }

    handleSelectMonth = (monthActive) => { this.setState({ monthActive }) }

    render () {
        const { monthActive } = this.state;

        return <div className="main-content">
            <div className="plannings-items">

                <Months active={monthActive} onSelect={this.handleSelectMonth}/>

            </div>
        </div>
    }

}