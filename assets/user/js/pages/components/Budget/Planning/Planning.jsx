import React, { Component } from "react";

import Sanitaze from "@commonComponents/functions/sanitaze";

import { Months } from "@dashboardComponents/Tools/Days";

const TYPE_EXPENSE = 0;
const TYPE_INCOME = 1;
const TYPE_SAVING = 2;

export class Planning extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: JSON.parse(props.donnees),
            yearActive: props.year,
            monthActive: 1
        }

        this.handleSelectYear = this.handleSelectYear.bind(this);
        this.handleSelectMonth = this.handleSelectMonth.bind(this);
    }

    handleSelectYear = (year) => {
        this.setState({ yearActive: year })
    }

    handleSelectMonth = (monthActive) => { this.setState({ monthActive }) }

    render () {
        const { data, yearActive, monthActive } = this.state;

        let totalExpenses = 0;
        let totalIncomes = 0;
        let totalSavings = 0;
        data.forEach(el => {
            if(el.month === monthActive){
                switch (el.type){
                    case TYPE_EXPENSE:
                        totalExpenses += el.price;
                        break;
                    case TYPE_INCOME:
                        totalIncomes += el.price;
                        break;
                    case TYPE_SAVING:
                        totalSavings += el.price;
                        break;
                    default:
                        break;
                }
            }
        })

        let cards = [
            { icon: "book", name: "Dépenses",  total: totalExpenses },
            { icon: "book", name: "Revenus",   total: totalIncomes },
            { icon: "book", name: "Economies", total: totalSavings },
        ]

        return <div className="main-content">
            <div className="plannings-items">
                <Years year={yearActive} onSelect={this.handleSelectYear} />
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
        const { year, onSelect } = this.props

        return <>
            <div className="days">
                <div className="day" onClick={(e) => onSelect(parseInt(year) - 1)}>
                    <span className="icon-left-arrow" />
                </div>
                <div className="day active">{year}</div>

                <div className="day" onClick={(e) => onSelect(parseInt(year) + 1)}>
                    <span className="icon-right-arrow" />
                </div>
            </div>
        </>
    }
}