import React, { Component } from 'react';

import Sanitaze     from "@commonComponents/functions/sanitaze";

import { ButtonIcon }   from "@dashboardComponents/Tools/Button";

export class ItemsItem extends Component {
    render () {
        const { elem, onChangeSubContext, onDelete} = this.props;

        let icon = "add";
        if(elem.type === 0){
            icon = "minus"
        }else if(elem.type === 2){
            icon = "time"
        }

        return <div className="item">
            <div className="item-content">
                <div className="item-body">
                    <div className="infos infos-col-4">
                        <div className="col-1">
                            <div className="sub">{elem.createdAtString}</div>
                        </div>
                        <div className="col-2">
                            <div className="name">{elem.name}</div>
                            {elem.category ? <div className="sub">{elem.category.name}</div> : null}

                        </div>
                        <div className="col-3">
                            <div className={"name total-" + elem.type}>
                                <span className={"icon-" + icon} />
                                <span>{Sanitaze.toFormatCurrency(elem.price)}</span>
                            </div>
                            {elem.category && elem.category.type === 2 ? <>
                                <div className="sub">{Sanitaze.toFormatCurrency(elem.category.total)} / {Sanitaze.toFormatCurrency(elem.category.goal)}</div>
                            </> : null}
                        </div>
                        <div className="col-4 actions">
                            <ButtonIcon icon="pencil" onClick={() => onChangeSubContext("update", elem)}>Modifier</ButtonIcon>
                            <ButtonIcon icon="trash" onClick={() => onDelete(elem)}>Supprimer</ButtonIcon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}