package backend.backend.service;

import backend.backend.dto.PedidoItemRequestDTO;
import backend.backend.dto.PedidoRequestDTO;
import backend.backend.entity.Pedido;
import backend.backend.entity.PedidoItem;
import backend.backend.entity.Producto;
import backend.backend.repository.PedidoRepository;
import backend.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional
    public Pedido crearPedido(PedidoRequestDTO request) {
        Pedido pedido = new Pedido();
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado("COMPLETADO");
        pedido.setTotal(BigDecimal.ZERO);

        List<PedidoItem> items = new ArrayList<>();
        BigDecimal totalGeneral = BigDecimal.ZERO;

        for (PedidoItemRequestDTO itemRequest : request.getItems()) {
            // Buscar producto
            Producto producto = productoRepository.findById(itemRequest.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + itemRequest.getProductoId()));

            // Verificar stock
            if (producto.getStock() < itemRequest.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Descontar stock
            producto.setStock(producto.getStock() - itemRequest.getCantidad());
            productoRepository.save(producto);

            // Crear PedidoItem
            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.setPedido(pedido);
            pedidoItem.setProducto(producto);
            pedidoItem.setCantidad(itemRequest.getCantidad());
            pedidoItem.setPrecioUnitario(producto.getPrecio());

            // Calcular subtotal
            BigDecimal subtotal = producto.getPrecio().multiply(new BigDecimal(itemRequest.getCantidad()));
            pedidoItem.setSubtotal(subtotal);

            items.add(pedidoItem);
            totalGeneral = totalGeneral.add(subtotal);
        }

        pedido.setItems(items);
        pedido.setTotal(totalGeneral);

        return pedidoRepository.save(pedido);
    }
}
