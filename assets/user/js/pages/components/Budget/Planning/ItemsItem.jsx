import React, { Component } from 'react';

import Sanitaze     from "@commonComponents/functions/sanitaze";

import { ButtonIcon }   from "@dashboardComponents/Tools/Button";

export class ItemsItem extends Component {
    render () {
        const { elem, onDelete} = this.props

        return <div className="item">
            <div className="item-content">
                <div className="item-body">
                    <div className="infos infos-col-4">
                        <div className="col-1">
                            <div className="sub">{elem.createdAtString}</div>
                        </div>
                        <div className="col-2">
                            <div className="name">{elem.name}</div>
                        </div>
                        <div className="col-2">
                            <div className="sub">{Sanitaze.toFormatCurrency(elem.price)}</div>
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