const ID_LIBRO_MAESTRO = "1lHMpJKjheEG8sxiKb3K_-vkJrtbsuBBGkOuP5iA0Rcs";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(ID_LIBRO_MAESTRO);

    // Sincronizar beneficiarios completos
    if (data.action === 'syncBeneficiarios') {
      const sheet = ss.getSheetByName("Beneficiarios") || ss.insertSheet("Beneficiarios");
      sheet.clearContents();
      sheet.appendRow(["Código ID", "Nombre Completo", "Género", "Programa Académico", "Tipo Subsidio", "Activo"]);
      data.beneficiarios.forEach(b => {
        sheet.appendRow([b.codigo, b.nombre, b.genero, b.carrera, b.subsidio, b.activo ? "SÍ" : "NO"]);
      });
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, count: data.beneficiarios.length })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Registrar o actualizar entrega
    if (data.action === 'writeEntrega') {
      const sheet = ss.getSheetByName("Entregas_Registro");
      const rows = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.fecha) &&
            String(rows[i][2]) === String(data.codigo) &&
            String(rows[i][4]) === String(data.tipoSubsidio)) {
          sheet.getRange(i + 1, 2).setValue(data.horaEntrega || "");
          sheet.getRange(i + 1, 6).setValue(data.entregado ? "ENTREGADO" : "PENDIENTE");
          sheet.getRange(i + 1, 7).setValue(data.observacion || "Sync desde app");
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([
          data.fecha, data.horaEntrega || "", data.codigo, data.nombre,
          data.carrera, data.tipoSubsidio,
          data.entregado ? "ENTREGADO" : "PENDIENTE",
          data.observacion || "Sync desde app"
        ]);
      }
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, action: found ? "updated" : "inserted" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Eliminar entrega (revertir)
    if (data.action === 'deleteEntrega') {
      const sheet = ss.getSheetByName("Entregas_Registro");
      const rows = sheet.getDataRange().getValues();
      let deleted = false;
      for (let i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][0]) === String(data.fecha) &&
            String(rows[i][2]) === String(data.codigo) &&
            String(rows[i][4]) === String(data.tipoSubsidio)) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, deleted: deleted })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Default: append row (compatibilidad con versiones anteriores)
    const sheet = ss.getSheetByName("Entregas_Registro");
    sheet.appendRow([
      data.fecha, data.horaEntrega || "", data.codigo, data.nombre || "",
      data.carrera || "", data.tipoSubsidio || "",
      data.entregado ? "ENTREGADO" : "PENDIENTE",
      data.observacion || "Sync desde app"
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

