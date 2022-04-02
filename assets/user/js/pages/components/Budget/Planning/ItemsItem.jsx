import React, { Component } from 'react';

import Sanitaze     from "@commonComponents/functions/sanitaze";

import { ButtonIcon }   from "@dashboardComponents/Tools/Button";

export class ItemsItem extends Component {
    render () {
        const { elem, onDelete} = this.props;

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
                            <div className="sub">{elem.name}</div>
                        </div>
                        <div className="col-2">
                            <div className={"name total-" + elem.type}>
                                <span className={"icon-" + icon} />
                                <span>{Sanitaze.toFormatCurrency(elem.price)}</span>
                                <div className="tooltip">{elem.typeString}</div>
                            </div>
                        </div>
                        <div className="col-4 actions">
                            <ButtonIcon icon="trash" onClick={() => onDelete(elem)}>Supprimer</ButtonIcon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}