import React, { Component } from 'react';

import Sanitaze         from "@commonComponents/functions/sanitaze";

import { ButtonIcon }   from "@dashboardComponents/Tools/Button";

export class CategoriesItem extends Component {
    render () {
        const { elem, onChangeContext, onDelete } = this.props

        return <div className="item">
            <div className="item-content">
                <div className="item-body">
                    <div className="infos infos-col-4">
                        <div className="col-1">
                            <div className="name">
                                <span>{elem.name}</span>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="sub">{elem.typeString}</div>
                        </div>
                        <div className="col-3">
                            {elem.type === 2 && <div className="sub">{Sanitaze.toFormatCurrency(elem.total)} / {Sanitaze.toFormatCurrency(elem.goal)}</div>}
                        </div>
                        <div className="col-4 actions">
                            {elem.isNatif ? <div className="badge badge-default">Natif</div> : <>
                                <ButtonIcon icon="pencil" onClick={() => onChangeContext("update", elem)}>Modifier</ButtonIcon>
                                <ButtonIcon icon="trash" onClick={() => onDelete(elem)}>Supprimer</ButtonIcon>
                            </>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}