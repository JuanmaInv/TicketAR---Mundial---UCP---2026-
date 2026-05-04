import { g as getDefaultExportFromCjs, r as reactExports } from './index-CTVeoBLp.js';

var jsxRuntime$2 = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	"use strict";
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
}

var jsxRuntime$1 = jsxRuntime$2.exports;

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime$2.exports;
	hasRequiredJsxRuntime = 1;
	"use strict";
	if (true) {
	  jsxRuntime$2.exports = requireReactJsxRuntime_production();
	} else {
	  module.exports = require("./cjs/react-jsx-runtime.development.js");
	}
	return jsxRuntime$2.exports;
}

var jsxRuntimeExports = requireJsxRuntime();
const jsxRuntime = /*@__PURE__*/getDefaultExportFromCjs(jsxRuntimeExports);

"use client";
function BuyerForm({ partidoId, onValidacionExitosa }) {
  const [datosCompra, setDatosCompra] = reactExports.useState({
    //definimos el estado inicial del formulario con valores por defecto
    partidoId,
    // ID del partido a comprar
    cantidad: 1,
    // Selector de 1 a 6 (Por defecto 1)
    nombre: "",
    // Nombre del comprador
    apellido: "",
    // Apellido del comprador
    documento: "",
    // DNI o equivalente
    email: "",
    // Correo electronico para enviar el ticket
    telefono: "",
    // Telefono de contacto
    provincia: "",
    // Seleccionado de un combo
    localidad: ""
    // Localidad
  });
  const [errores, setErrores] = reactExports.useState({});
  const provincias = [
    "Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán"
  ];
  const validarCampo = (nombreCampo, valor) => {
    let error = "";
    const valorStr = valor.toString().trim();
    if (!valorStr && nombreCampo !== "cantidad") {
      return "* Este campo es obligatorio.";
    }
    if (nombreCampo === "cantidad") {
      const cant = typeof valor === "number" ? valor : parseInt(valor) || 0;
      if (cant < 1 || cant > 6) {
        error = "* La cantidad debe ser entre 1 y 6 entradas.";
      }
    } else if (nombreCampo === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorStr)) {
        error = "* Por favor ingresa un email válido.";
      }
    } else if (nombreCampo === "nombre" || nombreCampo === "apellido") {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valorStr)) {
        error = "* Solo se permiten letras y espacios.";
      } else if (valorStr.length < 2) {
        error = "* Debe tener al menos 2 caracteres.";
      }
    } else if (nombreCampo === "documento") {
      if (!/^\d{7,8}$/.test(valorStr)) {
        error = "* El DNI debe tener 7 u 8 números (sin puntos).";
      }
    } else if (nombreCampo === "telefono") {
      if (!/^\d{8,15}$/.test(valorStr)) {
        error = "* Debe contener solo números (mínimo 8 dígitos).";
      }
    }
    return error;
  };
  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    const nuevoValor = name === "cantidad" ? value === "" ? 0 : parseInt(value) : value;
    setDatosCompra((previo) => ({
      ...previo,
      [name]: nuevoValor
    }));
    const errorDelCampo = validarCampo(name, nuevoValor);
    setErrores((previo) => ({
      ...previo,
      [name]: errorDelCampo
    }));
  };
  const validarFormulario = () => {
    const nuevosErrores = {};
    Object.keys(datosCompra).forEach((key) => {
      if (key !== "partidoId") {
        const error = validarCampo(key, datosCompra[key]);
        if (error) nuevosErrores[key] = error;
      }
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  const manejarEnvio = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onValidacionExitosa(datosCompra);
    }
  };
  const getInputClass = (nombreCampo) => {
    return `w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-all text-zinc-900 ${errores[nombreCampo] ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-zinc-300 focus:ring-blue-500 bg-white"}`;
  };
  return (
    //aca debe ir todo el codigo del form donde usaremos los .map para generar los inputs y el select.
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-zinc-200",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-zinc-800 mb-2", children: "Datos del Comprador" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 mb-6", children: "Informacion de contacto del comprador." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: manejarEnvio, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Nombre" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    name: "nombre",
                    value: datosCompra.nombre,
                    onChange: manejarCambioInput,
                    className: getInputClass("nombre")
                  }
                ),
                errores.nombre && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.nombre })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Apellido" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    name: "apellido",
                    value: datosCompra.apellido,
                    onChange: manejarCambioInput,
                    className: getInputClass("apellido")
                  }
                ),
                errores.apellido && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.apellido })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Documento (DNI)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    name: "documento",
                    value: datosCompra.documento,
                    onChange: manejarCambioInput,
                    className: getInputClass("documento")
                  }
                ),
                errores.documento && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.documento })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "email",
                    name: "email",
                    value: datosCompra.email,
                    onChange: manejarCambioInput,
                    className: getInputClass("email")
                  }
                ),
                errores.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.email })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Teléfono" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "tel",
                    name: "telefono",
                    value: datosCompra.telefono,
                    onChange: manejarCambioInput,
                    className: getInputClass("telefono")
                  }
                ),
                errores.telefono && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.telefono })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Provincia" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    name: "provincia",
                    value: datosCompra.provincia,
                    onChange: manejarCambioInput,
                    className: getInputClass("provincia"),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Selecciona tu provincia" }),
                      provincias.map((provincia) => (
                        //aca esta el listado de provincias
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: provincia, children: provincia }, provincia)
                      ))
                    ]
                  }
                ),
                errores.provincia && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.provincia })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Localidad" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    name: "localidad",
                    value: datosCompra.localidad,
                    onChange: manejarCambioInput,
                    className: getInputClass("localidad")
                  }
                ),
                errores.localidad && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.localidad })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-zinc-700 mb-1", children: "Cantidad de entradas (Máx. 6)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    name: "cantidad",
                    min: "1",
                    max: "6",
                    onChange: manejarCambioInput,
                    onInvalid: (e) => e.target.setCustomValidity("El valor debe ser mayor o igual a 1"),
                    onInput: (e) => e.target.setCustomValidity(""),
                    className: getInputClass("cantidad")
                  }
                ),
                errores.cantidad && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1 font-medium", children: errores.cantidad })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-8 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]", children: "Validar Datos y Continuar" })
          ] })
        ]
      }
    )
  );
}

export { BuyerForm as default };
//# sourceMappingURL=BuyerForm-0xIkJUxG.js.map
