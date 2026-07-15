const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteOrder() {
    const orderNumber = 'order_62665';
    
    // First find the order
    const { data: order, error: findError } = await supabase
        .from('production_orders')
        .select('*')
        .eq('pos_order_id', orderNumber)
        .single();
        
    if (findError) {
        console.error('Error finding order:', findError);
        return;
    }
    
    if (!order) {
        console.log('Order not found:', orderNumber);
        return;
    }
    
    console.log('Found order:', order.id, 'with sale_id:', order.sale_id);
    
    // Delete from production_orders
    const { error: deleteOrderError } = await supabase
        .from('production_orders')
        .delete()
        .eq('id', order.id);
        
    if (deleteOrderError) {
        console.error('Error deleting production order:', deleteOrderError);
    } else {
        console.log('Production order deleted successfully!');
    }

    // Delete the sale if sale_id exists
    if (order.sale_id) {
        const { error: deleteSaleError } = await supabase
            .from('sales')
            .delete()
            .eq('id', order.sale_id);
            
        if (deleteSaleError) {
            console.error('Error deleting sale:', deleteSaleError);
        } else {
            console.log('Sale deleted successfully!');
        }
    }
}

deleteOrder();
