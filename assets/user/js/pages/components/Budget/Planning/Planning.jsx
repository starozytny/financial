import React, { Component } from "react";

import Sanitaze from "@commonComponents/functions/sanitaze";

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

        let cards = [
            { icon: "book", name: "Dépenses",  total: 100000 },
            { icon: "book", name: "Revenus",   total: 100000 },
            { icon: "book", name: "Economies", total: 100000 },
        ]

        return <div className="main-content">
            <div className="plannings-items">
                <Years year={2022} />
                <Months active={monthActive} onSelect={this.handleSelectMonth}/>
            </div>

            <div className="budget">
                <div className="cards">
                    {cards.map((card, index) => {
                        return <div className="card" key={index}>
                            <div className="card-header">
                                <div className="icon">
                                    <span className={"icon-" + card.icon} />
                                </div>
                                <div className="title">
                                    <div className="name">{card.name}</div>
                                    <div className="total">{Sanitaze.toFormatCurrency(card.total)}</div>
                                </div>
                            </div>
                        </div>
                    })}
                </div>

                <div className="items">

                </div>
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