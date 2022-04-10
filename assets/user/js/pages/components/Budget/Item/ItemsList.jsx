import React, { Component } from 'react';

import { Filter, FilterSelected }   from "@dashboardComponents/Layout/Filter";
import { TopSorterPagination }      from "@dashboardComponents/Layout/Pagination";
import { Search }                   from "@dashboardComponents/Layout/Search";
import { Alert }                    from "@dashboardComponents/Tools/Alert";
import {Button, ButtonIcon} from "@dashboardComponents/Tools/Button";

import Sanitaze from "@commonComponents/functions/sanitaze";

import { ItemsItem }      from "@userPages/components/Budget/Item/ItemsItem";
import { ItemFormulaire } from "@userPages/components/Budget/Item/ItemForm";
import { ChartDay }       from "@userPages/components/Stats/Charts";


let i = 0;

export class ItemsList extends Component {
    constructor(props) {
        super(props);

        this.filter = React.createRef();

        this.handleFilter = this.handleFilter.bind(this);
    }

    handleFilter = (e) => {
        this.filter.current.handleChange(e, true);
    }

    render () {
        const { subContext, taille, data, dataImmuable, perPage, onGetFilters, filters, onSearch, onPerPage,
            onPaginationClick, currentPage, sorters, onSorter,
            onUpdateList, typeItem, year, month, categories, total, element, onChangeSubContext } = this.props;

        let filtersLabel = ["Dépenses", "Revenus", "Economies"];
        let filtersId    = ["f-expenses", "f-revenus", "f-economies"];

        let itemsFilter = [
            { value: 0, id: filtersId[0], label: filtersLabel[0]},
            { value: 1, id: filtersId[1], label: filtersLabel[1]},
            { value: 2, id: filtersId[2], label: filtersLabel[2]}
        ];

        let savings = [];
        if(categories){
            categories.forEach(cat => {
                if(cat.type === 2){
                    savings.push(cat);
                }
            })
        }

        return <>
            <div className="page-col-2">
                <div className="col-2">
                    <div>
                        <ItemFormulaire type={subContext} element={element} onChangeSubContext={onChangeSubContext}
                                        year={year} month={month} categories={categories} total={total} typeItem={typeItem}
                                        onUpdateList={onUpdateList} key={i++} />
                    </div>

                    {savings.length !== 0 && <>
                        <div className="use-saving">
                            <h2>Utilisation des économies</h2>
                            <div>
                                <Saving data={savings} />
                            </div>
                        </div>
                    </>}

                    {(dataImmuable && dataImmuable.length !== 0) && <>
                        <div className="charts">
                            <h2>Statistiques</h2>
                            <ChartDay data={dataImmuable} key={i++} />
                        </div>
                    </>}

                </div>
                <div className="col-1">
                    <div className="toolbar">
                        <div className="item filter-search">
                            <Filter ref={this.filter} items={itemsFilter} filters={filters} onGetFilters={onGetFilters} />
                            <Search onSearch={onSearch} placeholder="Recherche par description.."/>
                            <FilterSelected filters={filters} items={itemsFilter} onChange={this.handleFilter}/>
                        </div>
                    </div>

                    <TopSorterPagination sorters={sorters} onSorter={onSorter}
                                         currentPage={currentPage} perPage={perPage} onPerPage={onPerPage} taille={taille} onClick={onPaginationClick}/>

                    <div className="items-table">
                        <div className="items items-default items-budget">
                            <div className="item item-header">
                                <div className="item-content">
                                    <div className="item-body">
                                        <div className="infos infos-col-4">
                                            <div className="col-1">Date</div>
                                            <div className="col-2">Description</div>
                                            <div className="col-3">Total</div>
                                            <div className="col-4 actions">Actions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {data && data.length !== 0 ? data.map(elem => {
                                return <ItemsItem {...this.props} elem={elem} key={elem.id}/>
                            }) : <Alert>Aucun résultat</Alert>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    }
}

function Saving ({ data }) {
    return <div className="items-table">
        <div className="items items-default">
            <div className="item item-header">
                <div className="item-content">
                    <div className="item-body">
                        <div className="infos infos-col-3">
                            <div className="col-1">Catégorie</div>
                            <div className="col-2">Objectif</div>
                            <div className="col-3 actions">Actions</div>
                        </div>
                    </div>
                </div>
            </div>
            {data.map(elem => {
                return <div className="item" key={elem.id}>
                    <div className="item-body">
                        <div className="infos infos-col-3">
                            <div className="col-1">{elem.name}</div>
                            <div className="col-2">{Sanitaze.toFormatCurrency(elem.total)} / {Sanitaze.toFormatCurrency(elem.goal)}</div>
                            <div className="col-3 actions">
                                {elem.total > 0 && <ButtonIcon icon="cart" >Utiliser</ButtonIcon>}
                            </div>
                        </div>
                    </div>
                </div>
            })}
        </div>
    </div>
}