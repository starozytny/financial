import React, { Component } from 'react';

import { Button }                   from "@dashboardComponents/Tools/Button";
import { Filter, FilterSelected }   from "@dashboardComponents/Layout/Filter";
import { TopSorterPagination }      from "@dashboardComponents/Layout/Pagination";
import { Search }                   from "@dashboardComponents/Layout/Search";
import { Alert }                    from "@dashboardComponents/Tools/Alert";

import { CategoriesItem }   from "@userPages/components/Budget/Category/CategoriesItem";

export class CategoriesList extends Component {
    constructor(props) {
        super(props);

        this.filter = React.createRef();

        this.handleFilter = this.handleFilter.bind(this);
    }

    handleFilter = (e) => {
        this.filter.current.handleChange(e, true);
    }

    render () {
        const { taille, data, perPage, onChangeContext, onGetFilters, filters, onSearch, onPerPage,
            onPaginationClick, currentPage, sorters, onSorter } = this.props;

        let filtersLabel = ["Dépenses", "Revenus", "Economies"];
        let filtersId    = ["f-expenses", "f-revenus", "f-economies"];

        let itemsFilter = [
            { value: 0, id: filtersId[0], label: filtersLabel[0]},
            { value: 1, id: filtersId[1], label: filtersLabel[1] },
            { value: 2, id: filtersId[2], label: filtersLabel[2]}
        ];

        return <>
            <div>
                <div className="toolbar">
                    <div className="item create">
                        <Button onClick={() => onChangeContext("create")}>Ajouter une catégorie</Button>
                    </div>
                    <div className="item filter-search">
                        <Filter ref={this.filter} items={itemsFilter} onGetFilters={onGetFilters} />
                        <Search onSearch={onSearch} placeholder="Recherche par intitulé.."/>
                        <FilterSelected filters={filters} items={itemsFilter} onChange={this.handleFilter}/>
                    </div>
                </div>

                <TopSorterPagination sorters={sorters} onSorter={onSorter}
                                     currentPage={currentPage} perPage={perPage} onPerPage={onPerPage} taille={taille} onClick={onPaginationClick}/>

                <div className="items-table">
                    <div className="items items-default">
                        <div className="item item-header">
                            <div className="item-content">
                                <div className="item-body">
                                    <div className="infos infos-col-3">
                                        <div className="col-1">Catégorie</div>
                                        <div className="col-2">Type</div>
                                        <div className="col-3 actions">Actions</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {data && data.length !== 0 ? data.map(elem => {
                            return <CategoriesItem {...this.props} elem={elem} key={elem.id}/>
                        }) : <Alert>Aucun résultat</Alert>}
                    </div>
                </div>
            </div>
        </>
    }
}