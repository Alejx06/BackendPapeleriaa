package backend.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class PedidoRequestDTO {
    private List<PedidoItemRequestDTO> items;
}
