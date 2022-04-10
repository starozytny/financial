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
            monthActive: (new Date()).getMonth() + 1,
            totalInit: parseFloat(props.totalInit),
            yearInit: (new Date()).getFullYear(),
            monthInit: (new Date()).getMonth() + 1,
        }

        this.items = React.createRef();

        this.handleSelectYear = this.handleSelectYear.bind(this);
        this.handleSelectMonth = this.handleSelectMonth.bind(this);
        this.handleUpdateData = this.handleUpdateData.bind(this);
        this.handleChangeContext = this.handleChangeContext.bind(this);
    }

    handleSelectYear = (year) => {
        const { yearInit, monthInit } = this.state;

        let self = this;
        Formulaire.loader(true);
        axios({ method: "GET", url: Routing.generate(URL_GET_DATA, {'year': year}), data: {} })
            .then(function (response) {
                let data = response.data;
                self.setState({ yearActive: year, monthActive: year === yearInit ? monthInit : 1, data: JSON.parse(data.items), totalInit: parseFloat(data.totalInit) })
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

    handUpdateDuplicate = (elem) => {
        const { data } = this.state;

        let nData = [...data, ...[elem]];

        console.log(elem)
        console.log(nData)

        this.setState({ data: nData })
    }

    render () {
        const { categories, haveCashback } = this.props;
        const { data, totalInit, yearActive, monthActive } = this.state;

        let totalExpenses = 0;
        let totalIncomes = 0;
        let totalSavings = 0;
        let totalCashback = 0;

        let totaux = [totalInit,0,0,0,0,0,0,0,0,0,0,0,0];

        let items = [];
        data.forEach(el => {
            if(el.month === monthActive){

                items.push(el);

                switch (el.type){
                    case TYPE_EXPENSE:
                        totalExpenses += el.price;
                        if(el.haveCashback){
                            totalCashback += el.price;
                        }
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

        for(let j = 1; j <= 12 ; j++){
            if(j > 1){
                totaux[j] = totaux[j - 1] + totaux[j];
            }else{
                totaux[j] = totalInit + totaux[j];
            }
        }

        return <div className="main-content">
            <div className="plannings-items">
                <Years year={yearActive} onSelect={this.handleSelectYear} />
                <Months totaux={totaux} active={monthActive} onSelect={this.handleSelectMonth}/>
            </div>

            <div className="budget">
                <div className="cards cards-review">
                    <div className={"card card-default " + (totaux[monthActive] > 1)}>
                        <div className="card-header">
                            <div className="icon">
                                <span className="icon-credit-card" />
                            </div>
                            <div className="title">
                                <div className="name">Budget disponible</div>
                                <div className="total">
                                    <span>{Sanitaze.toFormatCurrency(totaux[monthActive])}</span>
                                </div>
                                <div>
                                    <span>Initital : {Sanitaze.toFormatCurrency(totaux[monthActive - 1])}</span>
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
                                    <div className="total">
                                        <span>{Sanitaze.toFormatCurrency(card.total)}</span>
                                        {card.value === 0 && haveCashback && <span className="cashback">Cashback 2% : {Sanitaze.toFormatCurrency(totalCashback * (2/100))}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    })}
                </div>

                <div className="items">
                    <Items ref={this.items} onUpdateData={this.handleUpdateData} categories={JSON.parse(categories)} dataPlanning={data} total={totaux[12]}
                           donnees={JSON.stringify(items)} year={parseInt(yearActive)} month={parseInt(monthActive)} key={yearActive + "-" + monthActive}
                           onUpdateDuplicate={this.handUpdateDuplicate} />
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