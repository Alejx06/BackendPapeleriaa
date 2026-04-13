package backend.backend.controller;

import backend.backend.dto.ProductoDTO;
import backend.backend.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // GET - Obtener todos los productos
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> obtenerTodos() {
        List<ProductoDTO> productos = productoService.obtenerTodos();
        return ResponseEntity.ok(productos);
    }

    // GET - Obtener solo productos activos
    @GetMapping("/activos")
    public ResponseEntity<List<ProductoDTO>> obtenerActivos() {
        List<ProductoDTO> productos = productoService.obtenerActivos();
        return ResponseEntity.ok(productos);
    }

    // GET - Obtener producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable Long id) {
        ProductoDTO producto = productoService.obtenerPorId(id);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        }
        return ResponseEntity.notFound().build();
    }

    // GET - Obtener productos por categoría
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<ProductoDTO>> obtenerPorCategoria(@PathVariable String categoria) {
        List<ProductoDTO> productos = productoService.obtenerPorCategoria(categoria);
        return ResponseEntity.ok(productos);
    }

    // GET - Buscar productos por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoDTO>> buscar(@RequestParam String nombre) {
        List<ProductoDTO> productos = productoService.buscarPorNombre(nombre);
        return ResponseEntity.ok(productos);
    }

    // POST - Crear nuevo producto
    @PostMapping
    public ResponseEntity<ProductoDTO> crear(@RequestBody ProductoDTO dto) {
        ProductoDTO producto = productoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(producto);
    }

    // PUT - Actualizar producto
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Long id, @RequestBody ProductoDTO dto) {
        ProductoDTO producto = productoService.actualizar(id, dto);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE - Eliminar producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Long id) {
        if (productoService.eliminar(id)) {
            return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente"));
        }
        return ResponseEntity.notFound().build();
    }

    // PATCH - Desactivar producto
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<ProductoDTO> desactivar(@PathVariable Long id) {
        ProductoDTO producto = productoService.desactivar(id);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        }
        return ResponseEntity.notFound().build();
    }
}
