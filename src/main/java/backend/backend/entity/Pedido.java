package backend.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado;

    @Column(name = "total", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal total;

    @Column(name = "cliente_nombre", length = 100)
    private String clienteNombre;

    @Column(name = "cliente_email", length = 100)
    private String clienteEmail;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "direccion_envio", length = 255)
    private String direccionEnvio;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> items;
}
