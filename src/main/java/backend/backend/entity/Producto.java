package backend.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, columnDefinition = "DECIMAL(10,2)")
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 100)
    private String categoria;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(length = 1000)
    private String imagenUrl;
}
