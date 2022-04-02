import React, { Component } from "react";

import Sanitaze from "@commonComponents/functions/sanitaze";

export class Days extends Component {
    render () {
        const { data, dayActive, onSelectDay, useShortName = false } = this.props

        let days = [
            { id: 1, name: 'Lundi',    shortName: 'Lun' },
            { id: 2, name: 'Mardi',    shortName: 'Mar' },
            { id: 3, name: 'Mercredi', shortName: 'Mer' },
            { id: 4, name: 'Jeudi',    shortName: 'Jeu' },
            { id: 5, name: 'Vendredi', shortName: 'Ven' },
            { id: 6, name: 'Samedi',   shortName: 'Sam' },
        ];

        let items = days.map(elem => {

            let atLeastOne = false;
            if(data){
                data.forEach(el => {
                    if(el.day === elem.id || (el.slot && el.slot.day === elem.id)){
                        atLeastOne = true;
                    }
                })
            }

            return <div className={"day" + (elem.id === dayActive ? " active" : "") + (atLeastOne ? "" : " disabled")}
                        onClick={() => onSelectDay(elem.id, atLeastOne)}
                        key={elem.id}>
                {useShortName ? elem.shortName : elem.name}
            </div>
        })

        return <>
            <div className="days">
                {items}
            </div>
        </>
    }
}

export class Months extends Component {
    render () {
        const { totaux, active, onSelect, useShortName = false } = this.props

        let data = [
            { id: 1, name: 'Janvier',        shortName: 'Jan' },
            { id: 2, name: 'Février',        shortName: 'Fev' },
            { id: 3, name: 'Mars',           shortName: 'Mar' },
            { id: 4, name: 'Avril',          shortName: 'Avr' },
            { id: 5, name: 'Mai',            shortName: 'Mai' },
            { id: 6, name: 'Juin',           shortName: 'Jui' },
            { id: 7, name: 'Juillet',        shortName: 'Jui' },
            { id: 8, name: 'Août',           shortName: 'Aoû' },
            { id: 9, name: 'Septembre',      shortName: 'Sep' },
            { id: 10, name: 'Octobre',       shortName: 'Oct' },
            { id: 11, name: 'Novembre',      shortName: 'Nov' },
            { id: 12, name: 'Décembre',      shortName: 'Dèc' },
        ];

        let items = data.map(elem => {
            return <div className={"day" + (elem.id === active ? " active" : "")}
                        onClick={() => onSelect(elem.id)}
                        key={elem.id}>
                <div>{useShortName ? elem.shortName : elem.name}</div>
                <div>{Sanitaze.toFormatCurrency(totaux[elem.id])}</div>
            </div>
        })

        return <>
            <div className="days">
                {items}
            </div>
        </>
    }
}