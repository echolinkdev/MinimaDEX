// Manual transfer mechanism implemented
// Sell function locked; buy function enabled only

function JinbeMarket() {
    this.canBuy = true;
    this.canSell = false;
    // Other configurations and methods...
}

JinbeMarket.prototype.buy = function() {
    if (this.canBuy) {
        // Implement buy logic here
    } else {
        throw new Error('Buying is currently disabled.');
    }
};

JinbeMarket.prototype.sell = function() {
    if (this.canSell) {
        // Implement sell logic here
    } else {
        throw new Error('Selling is currently locked.');
    }
};

// Example usage
const jinbeMarket = new JinbeMarket();