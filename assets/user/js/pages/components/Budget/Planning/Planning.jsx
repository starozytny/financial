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

                <Years year={2022} />

                <Months active={monthActive} onSelect={this.handleSelectMonth}/>

            </div>
        </div>
    }

}

class Years extends Component {
    render () {
        const { year } = this.props

        return <>
            <div className="days">
                <div className="day">
                    <span className="icon-left-arrow" />
                </div>
                <div className="day active">{year}</div>

                <div className="day">
                    <span className="icon-right-arrow" />
                </div>
            </div>
        </>
    }
}