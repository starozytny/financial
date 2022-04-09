import React, { Component } from 'react';

import Sanitaze from "@commonComponents/functions/sanitaze";

import { ButtonIcon, ButtonIconDropdown } from "@dashboardComponents/Tools/Button";

export class ItemsItem extends Component {
    render () {
        const { elem, onChangeSubContext, onDelete, onActivate, onDuplicate } = this.props;

        let icon = "add";
        if(elem.type === 0){
            icon = "minus"
        }else if(elem.type === 2){
            icon = "time"
        }

        let dropdownItems = [
            {data: <div onClick={() => onDuplicate(elem)}>Copier au mois suivant</div>},
        ]

        if(!elem.isActive){
            dropdownItems = [...dropdownItems, ...[{data: <div onClick={() => onActivate(elem)}>Activer</div>}]]
        }

        return <div className={"item " + elem.isActive}>
            <div className="item-content">
                <div className="item-body">
                    <div className="infos infos-col-4">
                        <div className="col-1">
                            <div className="sub">{elem.isActive ? elem.updatedAtString ? elem.updatedAtString : elem.createdAtString : <span className="badge badge-5">Prévisionnel</span>}</div>
                        </div>
                        <div className="col-2">
                            <div className="name">{elem.name}</div>
                            {elem.category ? <div className="sub">{elem.category.name}</div> : null}

                        </div>
                        <div className="col-3">
                            <div className={"name total-" + elem.type}>
                                <span className={"icon-" + icon} />
                                <span>{Sanitaze.toFormatCurrency(elem.price)}</span>
                                {elem.haveCashback && <span className="haveCashback" /> }
                                {(elem.type === 0 && elem.haveCashback) && <>
                                    <span className="tooltip">Cashback 2% : {Sanitaze.toFormatCurrency(elem.price * (2/100))}</span>
                                </>}
                            </div>
                            {elem.category && elem.category.type === 2 ? <>
                                <div className="sub">{Sanitaze.toFormatCurrency(elem.category.total)} / {Sanitaze.toFormatCurrency(elem.category.goal)}</div>
                            </> : null}
                        </div>
                        <div className="col-4 actions">
                            <ButtonIcon icon="pencil" onClick={() => onChangeSubContext("update", elem)}>Modifier</ButtonIcon>
                            <ButtonIcon icon="trash" onClick={() => onDelete(elem)}>Supprimer</ButtonIcon>
                            <ButtonIconDropdown icon="more" text="" items={dropdownItems} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}