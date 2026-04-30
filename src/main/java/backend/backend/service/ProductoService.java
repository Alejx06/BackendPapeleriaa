package backend.backend.service;

import backend.backend.dto.ProductoDTO;
import backend.backend.entity.Producto;
import backend.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todos los productos
    public List<ProductoDTO> obtenerTodos() {
        return productoRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Obtener solo productos activos
    public List<ProductoDTO> obtenerActivos() {
        return productoRepository.findByActivoTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Obtener producto por ID
    public ProductoDTO obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // Obtener productos por categoría
    public List<ProductoDTO> obtenerPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar productos por nombre
    public List<ProductoDTO> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Crear nuevo producto
    public ProductoDTO crear(ProductoDTO dto) {
        Producto producto = convertToEntity(dto);
        Producto guardado = productoRepository.save(producto);
        return convertToDTO(guardado);
    }

    // Actualizar producto
    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setNombre(dto.getNombre());
                    producto.setDescripcion(dto.getDescripcion());
                    producto.setPrecio(dto.getPrecio());
                    producto.setStock(dto.getStock());
                    producto.setCategoria(dto.getCategoria());
                    producto.setActivo(dto.getActivo());
                    producto.setImagenUrl(dto.getImagenUrl());
                    Producto actualizado = productoRepository.save(producto);
                    return convertToDTO(actualizado);
                })
                .orElse(null);
    }

    // Eliminar producto
    public boolean eliminar(Long id) {
        if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Desactivar producto sin eliminarlo
    public ProductoDTO desactivar(Long id) {
        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setActivo(false);
                    Producto actualizado = productoRepository.save(producto);
                    return convertToDTO(actualizado);
                })
                .orElse(null);
    }

    // Convertir Entity a DTO
    private ProductoDTO convertToDTO(Producto producto) {
        return new ProductoDTO(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getStock(),
                producto.getCategoria(),
                producto.getActivo(),
                producto.getImagenUrl()
        );
    }

    // Convertir DTO a Entity
    private Producto convertToEntity(ProductoDTO dto) {
        return new Producto(
                dto.getId(),
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getPrecio(),
                dto.getStock(),
                dto.getCategoria(),
                dto.getActivo() != null ? dto.getActivo() : true,
                dto.getImagenUrl()
        );
    }
}
