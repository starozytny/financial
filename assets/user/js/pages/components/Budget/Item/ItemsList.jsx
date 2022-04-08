import React, { Component } from 'react';

import { Filter, FilterSelected }   from "@dashboardComponents/Layout/Filter";
import { TopSorterPagination }      from "@dashboardComponents/Layout/Pagination";
import { Search }                   from "@dashboardComponents/Layout/Search";
import { Alert }                    from "@dashboardComponents/Tools/Alert";

import { ItemsItem }      from "./ItemsItem";
import { ItemFormulaire } from "@userPages/components/Budget/Item/ItemForm";
import {ChartDay} from "@userPages/components/Stats/Charts";

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
            onUpdateList, typeItem, year, month, categories, total, element } = this.props;

        let filtersLabel = ["Dépenses", "Revenus", "Economies"];
        let filtersId    = ["f-expenses", "f-revenus", "f-economies"];

        let itemsFilter = [
            { value: 0, id: filtersId[0], label: filtersLabel[0]},
            { value: 1, id: filtersId[1], label: filtersLabel[1]},
            { value: 2, id: filtersId[2], label: filtersLabel[2]}
        ];

        return <>
            <div className="page-col-2">
                <div className="col-2">
                    <ItemFormulaire type={subContext} element={element}
                                    year={year} month={month} categories={categories} total={total} typeItem={typeItem}
                                    onUpdateList={onUpdateList} key={i++} />

                    <div className="charts">
                        <ChartDay data={dataImmuable} key={i++} />
                    </div>
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