package backend.backend.controller;

import backend.backend.dto.PedidoRequestDTO;
import backend.backend.entity.Pedido;
import backend.backend.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody PedidoRequestDTO request) {
        try {
            Pedido nuevoPedido = pedidoService.crearPedido(request);
            return new ResponseEntity<>(nuevoPedido, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno al procesar el pedido", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
