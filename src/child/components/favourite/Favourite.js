import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { truncate } from '../../services/formatters';
import Minichart from '../minichart/Minichart.js';
import Confirmation from './UnfavouriteConfirmation.js';
import { getStockData as quandlServiceGetStockData } from '../../services/QuandlService.js';
import currentWindowService from '../../services/currentWindowService';

import arrowUp from '../../assets/png/arrow_up.png';
import arrowDown from '../../assets/png/arrow_down.png';

const modalHeight = 84;
const bubbleHeadOffset = 25;
const bubbleHeadFlippedOffset = -10;
const modalOffset = 30;
const modalFlippedOffset = -89;

class Favourite extends Component {

    constructor(props) {
        super(props);
        this.onIconClick = this.onIconClick.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.onModalBackdropClick = this.onModalBackdropClick.bind(this);
        this.shouldPositionModalAboveStar = this.shouldPositionModalAboveStar.bind(this);
        this.modalBubbleHeadTopPosition = this.modalBubbleHeadTopPosition.bind(this);
        this.modalTopPosition = this.modalTopPosition.bind(this);

        this.state = { isDragging: false };
    }

    componentDidMount() {
        const stockCode = this.props.stockCode;
        quandlServiceGetStockData(stockCode)
            .then(response => {
                const data = response.stockData.data[0];
                const stockName = response.dataset.name;
                const stockData = {
                    name: stockName,
                    price: data.close,
                    delta: data.close - data.open,
                    percentage: (data.close - data.open) / data.open * 100
                };
                const chartData = response;
                this.props.bindings.onQuandlResponse(stockCode, stockName);
                this.setState({ stockData, chartData });
            });
    }

    onIconClick(e) {
        const { bindings, stockCode } = this.props;

        this.setState({ starTop: e.target.getBoundingClientRect().top });
        bindings.onIconClick(stockCode)(e);
        e.stopPropagation();
    }

    onMouseOver() {
        this.setState({ isHovered: true });
    }

    onMouseOut() {
        this.setState({ isHovered: false });
    }

    onDragStart(stockCode) {
        return e => {
            // TODO: fade out window if it's last stock
            const codeData = { code: stockCode };
            const windowData = { window: currentWindowService.getCurrentWindowName() };

            this.setState({ isDragging: true });
            e.dataTransfer.setData(JSON.stringify(codeData), '');  // used to access propery on dragEnter. Check getCodeFromDT in Sidebar.js
            e.dataTransfer.setData(JSON.stringify(windowData), '');
        };
    }

    onDragEnd() {
        this.setState({ isDragging: false });
    }

    onModalBackdropClick(e) {
        this.setState({ isHovered: false });
        this.props.bindings.onModalBackdropClick(e);
    }

    shouldPositionModalAboveStar(starTopPos) {
        const modalBottom = starTopPos + modalOffset + modalHeight;
        return modalBottom >= window.innerHeight;
    }

    modalBubbleHeadTopPosition() {
        return this.state.starTop + (this.shouldPositionModalAboveStar(this.state.starTop) ? bubbleHeadFlippedOffset : bubbleHeadOffset);
    }

    modalTopPosition() {
        return this.state.starTop + (this.shouldPositionModalAboveStar(this.state.starTop) ? modalFlippedOffset : modalOffset);
    }

    render() {
        const { stockCode, selected, bindings, isUnfavouriting, dragOver, dragOverBottom } = this.props;

        let { stockData, chartData } = this.state || {};
        const { isHovered, starTop, isDragging } = this.state || {};
        stockData = stockData || {};

        const favouriteWrapperCls = classNames({
            dragging: isDragging,
            dragOver,
            dragOverBottom
        });

        const favouriteCls = classNames({
            selected,
            dark: selected,
            hovered: isHovered
        });

        const price = !isNaN(+stockData.price) ? (+stockData.price).toFixed(2) : '';
        const delta = !isNaN(+stockData.delta) ? (+stockData.delta).toFixed(2) : '';
        const percentage = !isNaN(+stockData.percentage) ? Math.abs((+stockData.percentage)).toFixed(2) : '';
        const name = stockData.name ? truncate(stockData.name) : '';

        const confirmationBindings = {
            onModalConfirmClick: bindings.onModalConfirmClick(stockCode),
            onModalBackdropClick: this.onModalBackdropClick,
            modalBubbleHeadTopPosition: this.modalBubbleHeadTopPosition,
            modalTopPosition: this.modalTopPosition
        };

        return (
            <div
              id={`stock_${stockCode}`}
              draggable={!isUnfavouriting}
              className={`favouriteWrapper ${favouriteWrapperCls}`}
              onClick={bindings.onClick(stockCode, name)}
              onDragStart={this.onDragStart(stockCode)}
              onDragEnd={this.onDragEnd}
              onDoubleClick={() => bindings.onDoubleClick(stockCode, name)}
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
            >
                <div className="drop-target">
                    <div className={`darkens favourite tearable ${favouriteCls}`} draggable="false">
                        <div className="top">
                            <div className="button-icon star active" onClick={this.onIconClick}>&nbsp;</div>
                            {isUnfavouriting && <Confirmation
                              bindings={confirmationBindings}
                              isFlipped={this.shouldPositionModalAboveStar(starTop)}
                            />}
                            <div className="name">{name}</div>
                            <div className="code">{stockCode.toUpperCase()}</div>
                        </div>
                        <div className="bottom">
                            <Minichart stockCode={stockCode} chartData={chartData} />
                            <div className="details">
                                <div className="price">{price}</div>
                                <div className="delta">{delta}</div>
                                <div className="percentage">
                                    <img src={percentage > 0 ? arrowUp : arrowDown} className="stock-arrow" draggable="false" />
                                    {percentage}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hover-area"></div>
            </div>
        );
    }
}

Favourite.propTypes = {
    stockCode: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    bindings: PropTypes.shape({
        onClick: PropTypes.func.isRequired,
        onIconClick: PropTypes.func.isRequired,
        onQuandlResponse: PropTypes.func.isRequired,
        onDoubleClick: PropTypes.func.isRequired,
        onModalConfirmClick: PropTypes.func.isRequired,
        onModalBackdropClick: PropTypes.func.isRequired
    }).isRequired,
    isFavourite: PropTypes.bool.isRequired,
    isUnfavouriting: PropTypes.bool.isRequired,
    dragOver: PropTypes.bool.isRequired,
    dragOverBottom: PropTypes.bool.isRequired
};

export default Favourite;
