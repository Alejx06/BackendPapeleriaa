package backend.backend.dto;

import lombok.Data;

@Data
public class PedidoItemRequestDTO {
    private Long productoId;
    private Integer cantidad;
}
