import React, { Component } from 'react';

import Sanitaze         from "@commonComponents/functions/sanitaze";

import { ButtonIcon }   from "@dashboardComponents/Tools/Button";

export class CategoriesItem extends Component {
    render () {
        const { elem, items, onChangeContext, onDelete, onSwitchArchived } = this.props

        let nItems = [];
        if(items){
            items.forEach(el => {
                if(el.category && el.category.id === elem.id){
                    nItems.push(el);
                }
            })
        }

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
                            <div className={"badge badge-" + elem.type}>{elem.typeString}</div>
                        </div>
                        <div className="col-3">
                            {elem.type === 2 && <div className="sub">{Sanitaze.toFormatCurrency(elem.total)} / {Sanitaze.toFormatCurrency(elem.goal)}</div>}
                        </div>
                        <div className="col-4 actions">
                            {elem.isNatif ? <div className="badge badge-default">Natif</div> : <>
                                <ButtonIcon icon={elem.isArchived ? "upload" : "briefcase"} onClick={() => onSwitchArchived(elem)}>{elem.isArchived ? "Désarchiver" : "Archiver"}</ButtonIcon>
                                <ButtonIcon icon="pencil" onClick={() => onChangeContext("update", elem)}>Modifier</ButtonIcon>
                                <ButtonIcon icon="trash" onClick={() => onDelete(elem)}>Supprimer</ButtonIcon>
                            </>}
                        </div>
                    </div>
                </div>

                {nItems.map(el => {
                    console.log(el)
                    return <div className="item-body" key={el.id}>
                        <div className="infos infos-col-4">
                            <div className="col-1">
                                <div className="sub"><span>{el.createdAtString}</span></div>
                            </div>
                            <div className="col-2">
                                <div className="sub"><span>{el.name}</span></div>
                            </div>
                            <div className="col-3">
                                <div className="sub">{Sanitaze.toFormatCurrency(el.price)}</div>
                            </div>
                            <div className="col-4 actions" />
                        </div>
                    </div>
                })}
            </div>
        </div>
    }
}