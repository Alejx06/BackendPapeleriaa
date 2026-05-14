package backend.backend.controller;

import backend.backend.entity.Usuario;
import backend.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrar(usuario);
            // Devolver solo datos seguros (sin contraseña)
            return ResponseEntity.ok(Map.of(
                "id",     nuevoUsuario.getId(),
                "nombre", nuevoUsuario.getNombre(),
                "email",  nuevoUsuario.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) {
        try {
            Usuario usuario = usuarioService.login(loginRequest.getEmail(), loginRequest.getPassword());
            // Devolver solo datos seguros (sin contraseña)
            return ResponseEntity.ok(Map.of(
                "id",     usuario.getId(),
                "nombre", usuario.getNombre(),
                "email",  usuario.getEmail()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
