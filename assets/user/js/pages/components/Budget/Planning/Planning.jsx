import React, { Component } from "react";

import axios    from "axios";
import Routing  from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Sanitaze     from "@commonComponents/functions/sanitaze";
import Formulaire   from "@dashboardComponents/functions/Formulaire";

import { Months } from "@dashboardComponents/Tools/Days";
import { Items }  from "@userPages/components/Budget/Item/Items";

const TYPE_EXPENSE = 0;
const TYPE_INCOME = 1;
const TYPE_SAVING = 2;

const URL_GET_DATA = "api_budget_items_get_data"

export class Planning extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: JSON.parse(props.donnees),
            yearActive: props.year,
            monthActive: 1,
            yearMin: (new Date()).getFullYear()
        }

        this.items = React.createRef();

        this.handleSelectYear = this.handleSelectYear.bind(this);
        this.handleSelectMonth = this.handleSelectMonth.bind(this);
        this.handleUpdateData = this.handleUpdateData.bind(this);
        this.handleChangeContext = this.handleChangeContext.bind(this);
    }

    handleSelectYear = (year) => {
        let self = this;
        Formulaire.loader(true);
        axios({ method: "GET", url: Routing.generate(URL_GET_DATA, {'year': year}), data: {} })
            .then(function (response) {
                let data = response.data;
                self.setState({ yearActive: year, data: JSON.parse(data) })
            })
            .catch(function (error) {
                Formulaire.displayErrors(self, error);
            })
            .then(() => {
                Formulaire.loader(false);
            })
        ;
    }

    handleSelectMonth = (monthActive) => { this.setState({ monthActive }) }

    handleUpdateData = (data) => { this.setState({ data: data }) }

    handleChangeContext = (context, typeItem) => {
        this.items.current.handleChangeContext(context, null, typeItem);
    }

    render () {
        const { categories } = this.props;
        const { data, yearMin, yearActive, monthActive } = this.state;

        let totalExpenses = 0;
        let totalIncomes = 0;
        let totalSavings = 0;

        let totaux = [0,0,0,0,0,0,0,0,0,0,0,0];

        let items = [];
        data.forEach(el => {
            if(el.month === monthActive){

                items.push(el);

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

            if(el.type === TYPE_INCOME){
                totaux[el.month] = totaux[el.month] + el.price;
            }else{
                totaux[el.month] = totaux[el.month] - el.price;
            }
        })

        let cards = [
            { value: 0, name: "Dépenses",  total: totalExpenses, icon: "minus" },
            { value: 1, name: "Revenus",   total: totalIncomes,  icon: "add" },
            { value: 2, name: "Economies", total: totalSavings,  icon: "time" },
        ]

        let totalBudget = totalIncomes - (totalExpenses + totalSavings);

        return <div className="main-content">
            <div className="plannings-items">
                <Years year={yearActive} onSelect={this.handleSelectYear} />
                <Months totaux={totaux} active={monthActive} onSelect={this.handleSelectMonth}/>
            </div>

            <div className="budget">
                <div className="cards cards-review">
                    <div className={"card card-default " + (totalBudget > 1)}>
                        <div className="card-header">
                            <div className="icon">
                                <span className="icon-home" />
                            </div>
                            <div className="title">
                                <div className="name">Budget</div>
                                <div className="total">
                                    <span>{Sanitaze.toFormatCurrency(totalBudget)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="cards">
                    {cards.map((card, index) => {
                        return <div className="card" key={index} onClick={() => this.handleChangeContext("create", card.value)}>
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
                    <Items ref={this.items} onUpdateData={this.handleUpdateData} categories={JSON.parse(categories)} dataPlanning={data}
                           donnees={JSON.stringify(items)} year={parseInt(yearActive)} month={parseInt(monthActive)} key={yearActive + "-" + monthActive}/>
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