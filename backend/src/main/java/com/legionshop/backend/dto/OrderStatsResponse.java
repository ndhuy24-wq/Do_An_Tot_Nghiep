package com.legionshop.backend.dto;

public class OrderStatsResponse {
    private long totalOrders;
    private long pendingOrders;
    private long shippingOrders;
    private long doneOrders;
    private long cancelOrders;
    private long paidOrders;
    private long unpaidOrders;
    private long totalRevenue;
    private long todayRevenue;
    private long monthRevenue;

    public OrderStatsResponse(long totalOrders, long pendingOrders, long shippingOrders, long doneOrders,
                              long cancelOrders, long paidOrders, long unpaidOrders, long totalRevenue,
                              long todayRevenue, long monthRevenue) {
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.shippingOrders = shippingOrders;
        this.doneOrders = doneOrders;
        this.cancelOrders = cancelOrders;
        this.paidOrders = paidOrders;
        this.unpaidOrders = unpaidOrders;
        this.totalRevenue = totalRevenue;
        this.todayRevenue = todayRevenue;
        this.monthRevenue = monthRevenue;
    }

    public long getTotalOrders() { return totalOrders; }
    public long getPendingOrders() { return pendingOrders; }
    public long getShippingOrders() { return shippingOrders; }
    public long getDoneOrders() { return doneOrders; }
    public long getCancelOrders() { return cancelOrders; }
    public long getPaidOrders() { return paidOrders; }
    public long getUnpaidOrders() { return unpaidOrders; }
    public long getTotalRevenue() { return totalRevenue; }
    public long getTodayRevenue() { return todayRevenue; }
    public long getMonthRevenue() { return monthRevenue; }
}
