<template>
  <!-- =======================
      MAPA PRINCIPAL Y BOTONES
  ======================== -->
  <div class="d-md-flex d-block">
    <div :style="`height:${screenHeight - 65}px; width:100%`">
      <l-map ref="map" v-model:zoom="zoom" v-model:center="center" @ready="initMap">
        <!-- Capas base -->
        <l-control-layers :base-layers="baseLayers"></l-control-layers>
        <l-tile-layer :url="baseLayers.default.url" :layer-type="baseLayers.default.layerType" :name="baseLayers.default.name"></l-tile-layer>
        <l-tile-layer :url="baseLayers.satellite.url" :layer-type="baseLayers.satellite.layerType" :name="baseLayers.satellite.name"></l-tile-layer>

        <!-- Marcadores de propiedades -->
        <l-marker
          v-for="(property, index) in properties"
          :key="index"
          :lat-lng="property.location.coordinates"
          :draggable="(property._id === editingMarkerId) && isHostAdmin"
          @dragend="onMarkerDragEnd(property, $event)"
          v-if="!showNewMarker"
        >
          <l-popup class="row justify-content-center">
            <!-- Popup de cada propiedad -->
            <div class="col-12">
              <h2>
                <span class="text-info px-2 col-12"><i class="fas fa-home me-2"></i> {{ property.title }}</span>
              </h2>
            </div>
            <div class="col-12 d-flex flex-column align-items-center">
              <!-- Botón ver detalles -->
              <button
                v-if="editingMarkerId !== property._id"
                class="btn btn-primary mb-2 w-100"
                data-bs-toggle="modal"
                data-bs-target="#detailsProperty"
                @click="selectedProperty = property"
                :disabled="editingMarkerId === property._id"
              >
                Ver detalles
              </button>
              <!-- Botón mover punto -->
              <button
                v-if="isHostAdmin && editingMarkerId !== property._id && property.host.info._id === activeUser"
                class="btn btn-warning mb-2 w-100"
                @click="startEditing(property)"
              >
                Mover punto
              </button>
              <!-- Botón editar propiedad -->
              <button
                v-if="isHostAdmin && editingMarkerId !== property._id && property.host.info._id === activeUser"
                class="btn btn-secondary mb-2 w-100"
                data-bs-toggle="modal"
                data-bs-target="#editProperty"
                @click="selectedProperty = property; selectedAmenityCategory = 'Todas'"
              >
                Editar
              </button>
              <!-- Botones modo edición de marcador -->
              <div v-if="isHostAdmin && editingMarkerId === property._id" class="d-flex flex-column align-items-center w-100">
                <button class="btn btn-primary mb-2 w-100" @click="async () => { await calculateCoordinates(property); finalizeEditing(property); }">
                  Calcular Automáticamente
                </button>
                <button class="btn btn-success mb-2 w-100" @click="finalizeEditing(property)">
                  Establecer
                </button>
                <button class="btn btn-secondary w-100" @click="cancelEditing(property)">
                  Restaurar
                </button>
              </div>
            </div>
          </l-popup>
        </l-marker>

        <!-- Botón agregar nueva propiedad -->
        <div class="custom-button" v-if="isHostAdmin && !showNewMarker">
          <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#createProperty" @click="resetNewProperty">
            <i class="fas fa-plus-circle"></i>
            <span class="d-none d-md-inline"> Nueva Propiedad</span>
          </button>
        </div>
        <!-- Botón cancelar nueva propiedad -->
        <div class="custom-button" v-if="isHostAdmin && showNewMarker">
          <button class="btn btn-danger" @click="cancelNewProperty">
            <i class="fas fa-times"></i>
            <span class="d-none d-md-inline">Cancelar</span>
          </button>
        </div>
        <!-- Botón buscar propiedades -->
        <div class="custom-button-search" v-if="!showNewMarker">
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#searchProperty" @click="resetNewFarm">
            <i class="fas fa-magnifying-glass"></i>
            <span class="d-none d-md-inline">{{ " Buscar" }}</span>
          </button>
        </div>
      </l-map>
    </div>

    <!-- =======================
        MODALES
    ======================== -->

    <!-- Modal de creación de propiedad -->
    <Modal class="text-white" title="Crear Propiedad" id="createProperty" :footer="false" ref="createProperty">
      <template v-slot:modalBody>
        <div class="row">
          <div class="col-md-6 col-12">
            <Input label="Título*" id="newPropertyTitle" type="text" v-model="newProperty.title" icon="fas fa-heading"
              :minlength="10" :maxlength="100" required error-msg="Mín. 10, máx. 100 caracteres" />
          </div>
          <div class="col-md-6 col-12">
            <Select v-model="newProperty.host" id="selectUsers" label="Dueño de la propiedad:" icon="fas fa-user"
              :options="users" valKey="id" textKey="name" textKey03="email" :removeDefault="false"
              defaultText="Ninguno seleccionado" @change="changeHost($event)" />
          </div>
          <div class="col-12">
            <Input label="Descripción*" id="newPropertyDesc" type="textarea" v-model="newProperty.description"
              icon="far fa-comment-dots" :minlength="50" :maxlength="2000" required
              error-msg="Mín. 50, máx. 2000 caracteres" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Precio/noche (€)*" id="newPropertyPrice" type="number" v-model="newProperty.pricePerNight"
              min="1" icon="fas fa-euro-sign" required />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Huéspedes máx.*" id="newPropertyGuests" type="number" v-model="newProperty.maxGuests" min="1"
              max="50" icon="fas fa-users" required />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Habitaciones*" id="newPropertyBedrooms" type="number" v-model="newProperty.bedrooms" min="1"
              icon="fas fa-bed" required />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Baños*" id="newPropertyBathrooms" type="number" v-model="newProperty.bathrooms" min="1"
              icon="fas fa-bath" required />
          </div>

          <!-- Datos de dirección -->
          <div class="col-md-6 col-12">
            <Input label="Calle*" id="newPropertyStreet" v-model="newProperty.address.street" icon="fas fa-road"
              required />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Número de calle*" id="newPropertyNumber" v-model="newProperty.address.number"
              icon="fas fa-sort-numeric-up" required />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Municipio*" id="newPropertyMunicipality" v-model="newProperty.address.municipality"
              icon="fas fa-city" required />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Bloque (opcional)" id="newPropertyBlock" v-model="newProperty.address.block"
              icon="fas fa-building" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Escalera (opcional)" id="newPropertyStaircase" v-model="newProperty.address.staircase"
              icon="fas fa-sitemap" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Planta (opcional)" id="newPropertyFloor" v-model="newProperty.address.floor"
              icon="fas fa-layer-group" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Puerta (opcional)" id="newPropertyDoor" v-model="newProperty.address.door"
              icon="fas fa-door-open" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Ciudad*" id="newPropertyCity" v-model="newProperty.address.city" icon="fas fa-city"
              required />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Código Postal*" id="newPropertyPostal" v-model="newProperty.address.postalCode"
              icon="fas fa-map-pin" required />
          </div>
          <div class="col-md-6 col-12">
            <Input label="País*" id="newPropertyCountry" v-model="newProperty.address.country" icon="fas fa-flag"
              required />
          </div>
          <!-- Campo oculto para el tipo de ubicación -->
          <input type="hidden" v-model="newProperty.location.type" value="Point" />
          <div class="col-lg-3 col-12">
            <Input label="Latitud*" id="newPropertyLat" type="number" v-model="newProperty.location.coordinates[0]"
              step="any" icon="fas fa-map-marker-alt" required disabled />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Longitud*" id="newPropertyLong" type="number" v-model="newProperty.location.coordinates[1]"
              step="any" icon="fas fa-map-marker-alt" required disabled />
          </div>
        </div>
        <div class="row">
          <div class="col-12 mb-3">
            <label class="form-label fw-bold">Servicios/Amenities</label>
            <div class="mb-2">
              <select v-model="selectedAmenityCategory" class="form-select w-auto d-inline-block">
                <option v-for="cat in amenityCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button v-for="amenity in filteredAmenities" :key="amenity._id" type="button" class="amenity-btn"
                :class="{ selected: newProperty.amenities.includes(amenity._id) }"
                @click="toggleAmenity(amenity._id, 'newProperty')">
                {{ amenity.name }}
              </button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="alert alert-warning mt-3 fw-bold text-danger text-center" style="font-size: 1rem;">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <span>¡Advertencia! Solo recibirás el <u>80%</u> del importe por cada reserva.</span>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="btn btn-success" @click="validateAndCreateProperty">
            <i class="fas fa-save"></i> Crear Propiedad
          </button>
          <div v-if="formError" class="text-danger mt-2">Complete todos los campos obligatorios (*)</div>
        </div>
      </template>
    </Modal>

    <!-- Modal de edición de propiedad -->
    <Modal title="Editar Propiedad" id="editProperty" :footer="false" ref="editProperty">
      <template v-slot:modalBody v-if="selectedProperty">
        <div class="row">
          <div class="col-md-6 col-12">
            <Input label="Título*" id="editPropertyTitle" type="text" v-model="selectedProperty.title"
              icon="fas fa-heading" :minlength="10" :maxlength="100" required
              error-msg="Mín. 10, máx. 100 caracteres" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Anfitrión*:" id="editPropertyHost" type="text" v-model="hostDisplay" icon="fas fa-user"
              readonly />
          </div>
          <div class="col-12">
            <Input label="Descripción*" type="textarea" v-model="selectedProperty.description"
              icon="far fa-comment-dots" :minlength="50" :maxlength="2000" required
              error-msg="Mín. 50, máx. 2000 caracteres" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Precio/noche (€)*" type="number" v-model="selectedProperty.pricePerNight" min="1" required
              icon="fas fa-euro-sign" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Huéspedes máx.*" type="number" v-model="selectedProperty.maxGuests" min="1" max="50" required
              icon="fas fa-users" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Habitaciones*" type="number" v-model="selectedProperty.bedrooms" min="1" required
              icon="fas fa-bed" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Baños*" type="number" v-model="selectedProperty.bathrooms" min="1" required
              icon="fas fa-bath" />
          </div>

          <!-- Edición de dirección -->
          <div class="col-md-6 col-12">
            <Input label="Calle*" v-model="selectedProperty.address.street" required icon="fas fa-road" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Número de calle*" v-model="selectedProperty.address.number" required
              icon="fas fa-sort-numeric-up" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Municipio*" v-model="selectedProperty.address.municipality" required icon="fas fa-city" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Bloque (opcional)" v-model="selectedProperty.address.block" icon="fas fa-building" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Escalera (opcional)" v-model="selectedProperty.address.staircase" icon="fas fa-sitemap" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Planta (opcional)" v-model="selectedProperty.address.floor" icon="fas fa-layer-group" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="Puerta (opcional)" v-model="selectedProperty.address.door" icon="fas fa-door-open" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Ciudad*" v-model="selectedProperty.address.city" required icon="fas fa-city" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Código Postal*" v-model="selectedProperty.address.postalCode" required
              icon="fas fa-map-pin" />
          </div>
          <div class="col-md-6 col-12">
            <Input label="País*" v-model="selectedProperty.address.country" required icon="fas fa-flag" />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Latitud*" type="number" v-model="selectedProperty.location.coordinates[0]" step="any" required
              icon="fas fa-map-marker-alt" disabled />
          </div>
          <div class="col-lg-3 col-12">
            <Input label="Longitud*" type="number" v-model="selectedProperty.location.coordinates[1]" step="any"
              required icon="fas fa-map-marker-alt" disabled />
          </div>
        </div>
        <div class="row">
          <div class="col-12 mb-3">
            <label class="form-label fw-bold">Servicios/Amenities</label>
            <div class="mb-2">
              <select v-model="selectedAmenityCategory" class="form-select w-auto d-inline-block">
                <option v-for="cat in amenityCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button v-for="amenity in filteredAmenities" :key="amenity._id" type="button" class="amenity-btn" :class="{
                selected: selectedProperty.amenities.map(a => a._id || a).includes(amenity._id)
              }" @click="toggleAmenity(amenity._id, 'selectedProperty')">
                {{ amenity.name }}
              </button>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="btn btn-primary" @click="updateProperty">
            <i class="fas fa-save"></i> Guardar Cambios
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal de detalles de propiedad -->
    <Modal :title="selectedProperty ? selectedProperty.title : ''" id="detailsProperty" :footer="false" ref="detailsModal" class="property-details-modal">
      <template v-slot:modalBody>
        <div v-if="selectedProperty" class="row g-3">
          <!-- Anfitrion -->
          <div class="col-12">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <h3 class="h6 card-title text-muted mb-3">
                  <i class="fas fa-user me-2"></i>Anfitrión
                </h3>
                <div class="vstack gap-2">
                  <div>
                    <span class="fw-medium">Nombre: {{ selectedProperty.host.info.name }}</span>
                    <div class="text-secondary mt-2">Email: {{ selectedProperty.host.info.email }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="col-12 col-lg-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <h3 class="h6 card-title text-muted mb-3">
                  <i class="fas fa-map-marker-alt me-2"></i>Ubicación
                </h3>
                <div class="vstack gap-2">
                  <div>
                    <span class="fw-medium">{{ selectedProperty.address.street }} {{ selectedProperty.address.number
                    }}</span>
                    <div class="text-secondary mt-2">
                      {{ selectedProperty.address.municipality }}, {{ selectedProperty.address.postalCode }} {{
                        selectedProperty.address.city }}
                    </div>
                    <div class="text-secondary">{{ selectedProperty.address.country }}</div>
                    <div class="text-secondary small mt-2"
                      v-if="selectedProperty.address.block || selectedProperty.address.staircase || selectedProperty.address.floor || selectedProperty.address.door">
                      <span v-if="selectedProperty.address.block">Bloque: {{ selectedProperty.address.block }}
                        &nbsp;</span>
                      <span v-if="selectedProperty.address.staircase">Escalera: {{ selectedProperty.address.staircase }}
                        &nbsp;</span>
                      <span v-if="selectedProperty.address.floor">Planta: {{ selectedProperty.address.floor }}
                        &nbsp;</span>
                      <span v-if="selectedProperty.address.door">Puerta: {{ selectedProperty.address.door }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Precio -->
          <div class="col-12 col-lg-4">
            <div class="card bg-success text-white h-100 shadow-sm">
              <div class="card-body text-center d-flex flex-column justify-content-center">
                <h3 class="h6 card-title mb-3">
                  <i class="fas fa-euro-sign me-2"></i>Precio por noche
                </h3>
                <div class="display-5 fw-bold">{{ selectedProperty.pricePerNight }}</div>
                <span class="h5">€/noche</span>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <WeatherWidget :apikey="'7d1ee5415fc556be312b0c826b113911'" :lat="selectedProperty.location.coordinates[0]"
              :lon="selectedProperty.location.coordinates[1]" />
          </div>

          <!-- Detalles -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h3 class="h6 card-title text-muted mb-3">
                  <i class="fas fa-info-circle me-2"></i>Detalles de la propiedad
                </h3>
                <div class="row justify-content-center gap-5">
                  <div class="col-12 col-lg-3 d-flex align-items-center p-3 rounded border border-2 border-grey">
                    <i class="fas fa-bed me-2 text-primary fs-5"></i>
                    <div>
                      <div class="text-muted small">Habitaciones</div>
                      <div class="fw-medium">{{ selectedProperty.bedrooms }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-lg-3 d-flex align-items-center p-3 rounded border border-2 border-grey">
                    <i class="fas fa-bath me-2 text-info fs-5"></i>
                    <div>
                      <div class="text-muted small">Baños</div>
                      <div class="fw-medium">{{ selectedProperty.bathrooms }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-lg-3 d-flex align-items-center p-3 rounded border border-2 border-grey">
                    <i class="fas fa-users me-2 text-success fs-5"></i>
                    <div>
                      <div class="text-muted small">Huéspedes máx.</div>
                      <div class="fw-medium">{{ selectedProperty.maxGuests }}</div>
                    </div>
                  </div>
                </div>
                <!-- Amenities visualización moderna -->
                <div class="mt-4">
                  <h4 class="h6 text-muted mb-2">
                    <i class="fas fa-concierge-bell me-2"></i>Comodidades incluidas
                  </h4>
                  <div class="d-flex flex-wrap gap-2">
                    <template v-if="selectedProperty.amenities && selectedProperty.amenities.length">
                      <span
                        v-for="amenity in allAmenities.filter(a => selectedProperty.amenities.map(am => am._id || am).includes(a._id))"
                        :key="amenity._id" class="badge rounded-pill px-3 py-2"
                        :style="`background: linear-gradient(90deg, #3498db 60%, #6dd5fa 150%); color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;`">
                        {{ amenity.name }}
                      </span>
                    </template>
                    <span v-else class="text-muted">No se han especificado comodidades.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reseñas -->
          <div class="col-12">
            <div class="card h-100 shadow-sm">
              <div class="card-body d-flex flex-column">
                <h3 class="h6 card-title text-muted mb-3 d-flex align-items-center justify-content-between">
                  <span>
                    <i class="fas fa-star me-2"></i>Reseñas ({{ selectedProperty.reviews.length }})
                  </span>
                  <span v-if="selectedProperty.reviews.length > 0"
                    class="text-muted small ms-3 d-flex align-items-center">
                    <span class="me-2">Puntuación media:</span>
                    <span>
                      <!-- Estrellas -->
                      <span v-for="n in 5" :key="n">
                        <i v-if="n <= Math.floor(averageRating)" class="fas fa-star text-warning"></i>
                        <i v-else-if="n - 0.5 <= averageRating" class="fas fa-star-half-alt text-warning"></i>
                        <i v-else class="far fa-star text-warning"></i>
                      </span>
                    </span>
                  </span>
                </h3>

                <div class="vstack gap-2 overflow-auto"
                  :style="selectedProperty.reviews.length === 0 ? '' : 'max-height: 120px;'">
                  <!-- Mensaje si no hay reseñas -->
                  <div v-if="selectedProperty.reviews.length === 0" class="text-center text-muted mb-3">
                    No hay reseñas disponibles.
                  </div>
                  <!-- Reseñas -->
                  <div v-if="selectedProperty.reviews.length > 0">
                    <div v-for="review in selectedProperty.reviews" :key="review._id" class="mb-3 border-top pt-2">
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Autor: {{ review.author.info.name }}</small>
                        <small class="text-muted">
                          <span v-for="n in 5" :key="n">
                            <i
                              :class="n <= review.rating ? 'fas fa-star text-warning' : 'far fa-star text-warning'"></i>
                          </span>
                        </small>
                      </div>
                      <p class="mb-1">
                        <span class="fw-bold">Comentario:</span> {{ review.comment }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Coordenadas -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h3 class="h6 card-title text-muted mb-3">
                  <i class="fas fa-map-pin me-2"></i>Coordenadas GPS
                </h3>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-latitude me-2"></i>Lat
                  </span>
                  <input type="text" class="form-control" :value="selectedProperty.location.coordinates[0]" readonly>
                  <span class="input-group-text">
                    <i class="fas fa-longitude me-2"></i>Lon
                  </span>
                  <input type="text" class="form-control" :value="selectedProperty.location.coordinates[1]" readonly>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end gap-2">
          <button v-if="isHostAdmin && isHostOfSelectedProperty" type="button" class="btn btn-danger" data-bs-toggle="modal"
            data-bs-target="#deletePropertyModal">
            <i class="fas fa-trash me-2"></i>Eliminar
          </button>
          <button v-if="!isHostAdmin" type="button" class="btn btn-success" data-bs-toggle="modal"
            data-bs-target="#rentPropertyModal" @click="findBookedDates(selectedProperty._id)">
            <i class="fas fa-check me-2"></i>Alquilar
          </button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-2"></i>Cerrar
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal para alquilar propiedad -->
    <Modal title="Alquilar Propiedad" id="rentPropertyModal" :footer="false" ref="rentPropertyModal">
      <template v-slot:modalBody>
      <div class="container py-4">
        <!-- Encabezado -->
        <div class="row justify-content-center mb-3">
        <div class="col-12 text-center">
          <h2 class="fw-bold text-muted">Selecciona tus fechas</h2>
          <p class="text-muted">Elige el rango de fechas para tu reserva</p>
        </div>
        </div>

        <!-- Advertencia de cancelación si check-in es en <= 3 días -->
        <div
        v-if="
          newRental.range.start &&
          (new Date(newRental.range.start).setHours(0,0,0,0) - new Date().setHours(0,0,0,0) < 3 * 24 * 60 * 60 * 1000) &&
          (new Date(newRental.range.start).setHours(0,0,0,0) - new Date().setHours(0,0,0,0) >= 0)
        "
        class="row justify-content-center mb-3"
        >
        <div class="col-12">
          <div class="alert alert-warning text-center fw-bold" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Atención: Las reservas con fecha de check-in con proximidad de menos de 3 días <u>no podrán ser canceladas</u>.
          </div>
        </div>
        </div>

        <!-- Contenedor principal con igual altura -->
        <div class="row justify-content-center mb-4 align-items-stretch">
        <div class="row my-2">
          <!-- Número de huéspedes -->
          <div class="col-12">
          <Input label="Número de Huéspedes" id="numberOfGuests" type="number" v-model="newRental.numberOfGuests"
            icon="fas fa-users" min="1" :max="selectedProperty?.maxGuests || 1" required />
          </div>
        </div>
        <!-- DatePicker -->
        <div class="col-lg-6 col-12 my-2 h-100">
          <div class="h-100 d-flex flex-column">
          <date-picker :key="datePickerKey" expanded :is-dark="isDark" v-model.range="newRental.range"
            :min-date="new Date()" :disabled-dates="disabledDates" :is-date-disabled="validateDate" mode="date"
            is-range @update:modelValue="validateRange" class="p-2 rounded shadow-sm border h-100">
            <template #header-popover="{ inputValue }">
            <div class="text-center p-2">
              <span class="fw-bold text-dark">Selecciona tus fechas</span>
            </div>
            </template>
          </date-picker>
          </div>
        </div>

        <!-- Card de información -->
        <div class="col-lg-6 col-12 my-2 h-100">
          <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <div class="row flex-grow-1">
            <div class="col-12 mb-3">
              <h3 class="h6 card-title text-muted mb-0">Resumen de la reserva</h3>
            </div>
            <div class="row my-2">
              <!-- Check-in -->
              <div class="col-6">
              <p class="small text-muted mb-0">Check-in</p>
              <p class="fw-medium mb-0">
                {{
                (newRental.range.start && newRental.range.end &&
                  !(isSameDayFunc(newRental.range.start, new Date()) &&
                  isSameDayFunc(newRental.range.end, new Date())))
                  ? formatDate(newRental.range.start)
                  : '--/--/----'
                }}
              </p>
              </div>
              <!-- Check-out -->
              <div class="col-6">
              <p class="small text-muted mb-0">Check-out</p>
              <p class="fw-medium mb-0">
                {{
                (newRental.range.start && newRental.range.end &&
                  !(isSameDayFunc(newRental.range.start, new Date()) &&
                  isSameDayFunc(newRental.range.end, new Date())))
                  ? formatDate(newRental.range.end)
                  : '--/--/----'
                }}
              </p>
              </div>
            </div>
            <div class="row my-2">
              <!-- Precio/noche -->
              <div class="col-6">
              <p class="small text-muted mb-0">Precio/noche</p>
              <p class="fw-medium mb-0">
                {{ selectedProperty?.pricePerNight ? selectedProperty.pricePerNight + ' €' : '--' }}
              </p>
              </div>
              <!-- Noches -->
              <div class="col-6">
              <p class="small text-muted mb-0">Noches</p>
              <p class="fw-medium mb-0">
                {{
                (newRental.range.start && newRental.range.end)
                  ? nights
                  : '--'
                }}
              </p>
              </div>
            </div>
            </div>

            <hr>

            <div class="row mt-auto">
            <div class="col-12 d-flex justify-content-between align-items-center mb-2">
              <div>
              <i class="fas fa-calendar-check fa-2x text-success"></i>
              </div>
              <div class="text-end">
              <h4 class="mb-0 fw-bold">
                {{
                (newRental.range.start && newRental.range.end)
                  ? this.newRental.totalPrice.toFixed(2) + ' €'
                  : '--'
                }}
              </h4>
              <small>Precio total</small>
              </div>
            </div>
            </div>
          </div>
          </div>
        </div>
        </div>

        <!-- Botón de reserva -->
        <div class="row justify-content-center">
        <div class="col-md-8 col-12 text-center">
          <button class="btn btn-lg btn-success w-100 d-flex align-items-center justify-content-center"
          @click="openPaypalModalIfValid" :disabled="!isValidRange">
          <i class="fas fa-check-circle me-2"></i>
          <span>
            {{ isValidRange ? `Reservar por ${this.newRental.totalPrice.toFixed(2)} €` : 'Selecciona fechas' }}
          </span>
          </button>
        </div>
        </div>

        <!-- Mensaje de error de rango -->
        <div v-if="rangeError" class="row justify-content-center mt-3">
        <div class="col-md-8 col-12">
          <div class="alert alert-danger text-center" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i> {{ rangeError }}
          </div>
        </div>
        </div>
      </div>
      </template>
    </Modal>

    <!-- Modal de PayPal -->
    <Modal title="Pago con PayPal" id="paypalModal" :footer="false" ref="paypalModal">
      <template v-slot:modalBody>
        <div id="paypal-button-container"></div>
      </template>
      <template v-slot:modalFooter>
        <button class="btn btn-secondary" @click="$refs.paypalModal.close()">
          Cancelar
        </button>
      </template>
    </Modal>

    <!-- Modal de confirmación para borrar propiedad -->
    <ModalConfirm
      id="deletePropertyModal"
      title="Borrar propiedad"
      message="La propiedad seleccionada será borrada de la base de datos. Esta acción es irreversible"
      reject="No borrar"
      confirm="Borrar propiedad"
      @performAction="deleteProperty(selectedProperty._id)"
      @cancel="selectedProperty = null"
      ref="deletePropertyModal"
    ></ModalConfirm>

    <!-- Modal para buscar propiedad -->
    <Modal title="Buscar Propiedades" id="searchProperty" :footer="false" ref="searchProperty" clase="modal-xl">
      <template v-slot:modalBody>
        <div class="row g-3">
          <!-- Campos de búsqueda -->
          <div class="col-md-6">
            <Input label="Título" id="searchTitle" type="text" v-model="search.title" icon="fas fa-heading" />
          </div>
          <div class="col-md-6">
            <Input label="Ciudad" id="searchCity" type="text" v-model="search.city" icon="fas fa-city" />
          </div>
          <div class="col-md-6">
            <Input label="País" id="searchCountry" type="text" v-model="search.country" icon="fas fa-flag" />
          </div>
          <div class="col-md-3">
            <Input label="Precio mínimo (€)" id="searchPriceMin" type="number" v-model="search.priceMin"
              icon="fas fa-euro-sign" min="1" />
          </div>
          <div class="col-md-3">
            <Input label="Precio máximo (€)" id="searchPriceMax" type="number" v-model="search.priceMax"
              icon="fas fa-euro-sign" min="1" />
          </div>
          <div class="col-md-3">
            <Input label="Huéspedes máx." id="searchGuests" type="number" v-model="search.maxGuests" icon="fas fa-users"
              min="1" />
          </div>
          <div class="col-md-3">
            <Input label="Habitaciones" id="searchBedrooms" type="number" v-model="search.bedrooms" icon="fas fa-bed"
              min="1" />
          </div>
          <div class="col-md-3">
            <Input label="Baños" id="searchBathrooms" type="number" v-model="search.bathrooms" icon="fas fa-bath"
              min="1" />
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-between">
          <button class="btn btn-success" @click="searchProperties">
            <i class="fas fa-magnifying-glass"></i> Buscar
          </button>
          <button class="btn btn-secondary" @click="resetSearch">
            <i class="fas fa-undo"></i> Reiniciar
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
// =======================
// IMPORTS
// =======================
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LControlLayers, LPopup } from "@vue-leaflet/vue-leaflet";
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { differenceInDays, eachDayOfInterval, startOfDay, isSameDay, format, areIntervalsOverlapping } from 'date-fns';
import { useUsersStore } from '@/stores/UsersVuex';
import PropertyService from "../../../services/PropertyService";
import ReviewsService from '@/services/ReviewsService';
import BookingsService from "../../../services/BookingsService";
import PaymentService from "../../../services/PaymentService";
import UserService from "../../../services/UserService";
import AmenitiesService from "../../../services/AmenitiesService";
import MailerService from "@/services/MailerService";
import Modal from "@/components/commons/Modal";
import ModalConfirm from "@/components/commons/ModalConfirm";
import Select from "@/components/commons/Select";
import Input from "@/components/commons/Input";
import WeatherWidget from "../../../components/weather/WeatherWidget.vue";

export default {
  // =======================
  // COMPONENTES HIJOS
  // =======================
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LControlLayers,
    LPopup,
    Modal,
    Input,
    Select,
    ModalConfirm,
    WeatherWidget,
    DatePicker
  },
  // =======================
  // PROPIEDADES
  // =======================
  props: {
    isDark: {
      type: Boolean,
      default: true
    }
  },
  // =======================
  // DATOS REACTIVOS
  // =======================
  data() {
    return {
      // Estado del mapa
      zoom: 2.5,
      center: [37.9460000, -5.7623300],
      userLocation: null,
      screenHeight: 0,
      // Propiedades y usuarios
      properties: [],
      reviews: [],
      users: [],
      activeUser: useUsersStore().v_userdata._id,
      // Capas base del mapa
      baseLayers: {
        default: {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          layerType: "base",
          name: "Predeterminado"
        },
        satellite: {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          layerType: "base",
          name: "Satellite"
        }
      },
      // Estado de formularios y modales
      selectedProperty: null,
      newProperty: {
        title: '',
        description: '',
        host: null,
        location: { type: "Point", coordinates: [,] },
        address: {
          street: '', number: '', municipality: '', block: '', staircase: '', floor: '', door: '', city: '', country: '', postalCode: ''
        },
        pricePerNight: 1,
        maxGuests: 1,
        bedrooms: 1,
        bathrooms: 1,
        amenities: []
      },
      search: {
        title: '', city: '', country: '', priceMin: null, priceMax: null, maxGuests: null, bedrooms: null, bathrooms: null,
      },
      showNewMarker: false,
      editingMarkerId: null,
      editingCoordinatesBackup: [],
      formError: false,
      // Estado de alquiler/reserva
      newRental: {
        guest: useUsersStore().v_userdata._id,
        propertyId: null,
        range: { start: new Date(), end: new Date() },
        totalPrice: 0,
        status: 'pending',
        payment: null,
        numberOfGuests: 1
      },
      datePickerKey: 0,
      newPayment: {
        bookingId: null,
        amount: 0,
        paymentMethod: 'paypal',
        transactionId: null,
        status: 'pending',
        paidAt: null
      },
      bookedDates: [],
      disabledDates: [],
      _paypalRendered: false,
      // Amenities
      allAmenities: [],
      amenityCategories: [],
      selectedAmenityCategory: 'Todas',
    }
  },
  // =======================
  // CICLO DE VIDA
  // =======================
  created() {
    this.getScreenHeight();
    window.addEventListener('resize', this.getScreenHeight);
  },
  destroyed() {
    window.removeEventListener('resize', this.getScreenHeight);
  },
  mounted() {
    this.injectSDKPayPal();
    this.retriveReviews();
    this.retrieveProperties();
    this.loadAmenities();
    setTimeout(() => {
      this.retrieveUsers();
    }, 500);
  },
  // =======================
  // COMPUTED PROPERTIES
  // =======================
  computed: {
    // ¿El usuario es admin o host?
    isHostAdmin() {
      return useUsersStore().v_userdata?.role.actions.includes('PROPERTY_ADMIN') ||
        useUsersStore().v_userdata?.role.actions.includes('ADMIN');
    },
    // ¿El usuario es el anfitrión de la propiedad seleccionada?
    isHostOfSelectedProperty() {
      return this.selectedProperty && this.activeUser === this.selectedProperty.host.info._id;
    },
    // Texto para mostrar el host
    hostDisplay() {
      return this.selectedProperty?.host
        ? `${this.selectedProperty.host.info.name} - ${this.selectedProperty.host.info.email}`
        : '';
    },
    // ¿El rango de fechas es válido?
    isValidRange() {
      return (
        this.newRental.range.start &&
        this.newRental.range.end &&
        !this.rangeError &&
        this.newRental.range.start < this.newRental.range.end
      )
    },
    // Número de noches de la reserva
    nights() {
      if (this.isValidRange) {
        const nights = differenceInDays(
          this.newRental.range.end,
          this.newRental.range.start
        );
        this.newRental.totalPrice = nights * this.selectedProperty.pricePerNight;
        return nights;
      }
      return 0;
    },
    // Puntuación media de la propiedad seleccionada
    averageRating() {
      if (!this.selectedProperty.reviews.length) return 0;
      const sum = this.selectedProperty.reviews.reduce((acc, review) => acc + review.rating, 0);
      return sum / this.selectedProperty.reviews.length;
    },
    // Amenities filtrados por categoría
    filteredAmenities() {
      if (this.selectedAmenityCategory === 'Todas') return this.allAmenities;
      return this.allAmenities.filter(a => (a.category || 'Sin categoría').toLowerCase() === this.selectedAmenityCategory.toLowerCase());
    }
  },
  // =======================
  // WATCHERS
  // =======================
  watch: {
    // Observa cambios en la dirección para geocodificar automáticamente
    'newProperty.address': {
      async handler(newAddress) {
        const requiredFields = newAddress.street && newAddress.number &&
          newAddress.municipality && newAddress.city &&
          newAddress.postalCode && newAddress.country;
        if (requiredFields) {
          const coords = await this.geocodeAddress(newAddress);
          if (coords) {
            this.newProperty.location.coordinates = [...coords];
          }
        }
      },
      deep: true
    }
  },
  // =======================
  // MÉTODOS
  // =======================
  methods: {
    // =======================
    // PROPIEDADES CRUD
    // =======================
    async retrieveProperties() {
      // Recupera propiedades y asocia reviews y datos de host
      try {
        const response = await PropertyService.getProperties();
        this.properties = response.data.map(p => (Object.assign({}, p, {
          location: p.location || { type: 'Point', coordinates: [,] }
        })));
        this.properties.forEach(async property => {
          await UserService.getDataHost(property.host._id).then(res => {
            property.host = {
              info: {
                _id: res.data._id,
                name: res.data.name,
                email: res.data.email,
                paypalEmail: res.data.paypalEmail
              }
            }
          });

          property.reviews = this.reviews.filter(review => review.booking.property === property._id);
        });
      } catch (error) {
        console.error("Error al obtener propiedades:", error);
      }
    },
    async createProperty() {
      // Crea una nueva propiedad
      try {
        await PropertyService.createProperty(this.newProperty);
        this.retrieveProperties();
        this.resetNewProperty();
        this.showNewMarker = false;
        this.$refs.createProperty.closeModal();
      } catch (error) {
        console.error("Error al crear la propiedad:", error.response?.data);
      }
    },
    async validateAndCreateProperty() {
      // Valida y crea la propiedad
      if (this.newProperty.address) {
        const coords = await this.geocodeAddress(this.newProperty.address);
        if (coords) this.newProperty.location.coordinates = coords;
      }
      const addr = this.newProperty.address;
      const isValid = this.newProperty.title.length >= 5 &&
        this.newProperty.title.length <= 100 &&
        this.newProperty.description.length >= 20 &&
        this.newProperty.description.length <= 2000 &&
        this.newProperty.host &&
        this.newProperty.pricePerNight > 0 &&
        addr.street && addr.number && addr.municipality &&
        addr.city && addr.postalCode && addr.country;
      this.formError = !isValid;
      if (isValid) this.createProperty();
    },
    async updateProperty() {
      // Actualiza la propiedad seleccionada
      try {
        await PropertyService.updateProperty(this.selectedProperty._id, this.selectedProperty);
        this.retrieveProperties();
      } catch (error) {
        console.error("Error al actualizar la propiedad:", error.response?.data);
      }
    },
    async deleteProperty(id) {
      // Elimina una propiedad
      try {
        await PropertyService.deleteProperty(id);
        this.retrieveProperties();
      } catch (error) {
        console.error("Error al eliminar la propiedad:", error);
      }
    },
    resetNewProperty() {
      // Reinicia el formulario de nueva propiedad
      this.newProperty = {
        title: '',
        description: '',
        host: null,
        location: { type: "Point", coordinates: [,] },
        address: {
          street: '', number: '', municipality: '', block: '', staircase: '', floor: '', door: '', city: '', country: '', postalCode: ''
        },
        pricePerNight: 1,
        maxGuests: 1,
        bedrooms: 1,
        bathrooms: 1,
        amenities: []
      };
      this.selectedAmenityCategory = 'Todas';
    },
    cancelNewProperty() {
      // Cancela la creación de nueva propiedad
      this.showNewMarker = false;
      this.resetNewProperty();
    },
    changeHost(event) {
      // Cambia el anfitrión de la nueva propiedad
      this.newProperty.host = event.target.value;
    },
    hidePropertyInfo() {
      // Oculta la info de la propiedad seleccionada
      this.selectedProperty = null;
    },

    // =======================
    // RESEÑAS
    // =======================
    async retriveReviews() {
      // Recupera todas las reseñas
      try {
        const response = await ReviewsService.getAllReviews();
        this.reviews = response.data.reviews;
      } catch (error) {
        console.error('Error al obtener los comentarios:', error);
      }
    },

    // =======================
    // MAPA Y COORDENADAS
    // =======================
    setNewCoordinates(e) {
      // Establece nuevas coordenadas al mover un marcador
      if (this.selectedProperty) {
        this.selectedProperty.location.coordinates = [
          e.target._latlng.lat,
          e.target._latlng.lng
        ];
      }
    },
    startEditing(property) {
      // Inicia modo edición de marcador
      this.editingMarkerId = property._id;
      this.editingCoordinatesBackup = [...property.location.coordinates];
    },
    async finalizeEditing(property) {
      // Finaliza edición de marcador y guarda coordenadas
      if (this.isHostAdmin) {
        try {
          await PropertyService.updateCoordinates(property._id, property.location);
        } catch (error) {
          console.error("Error al actualizar las coordenadas:", error);
        }
        this.editingMarkerId = null;
        this.editingCoordinatesBackup = [];
      }
    },
    cancelEditing(property) {
      // Cancela edición de marcador y restaura coordenadas
      property.location.coordinates = [...this.editingCoordinatesBackup];
      this.editingMarkerId = null;
      this.editingCoordinatesBackup = [];
    },
    onMarkerDragEnd(property, event) {
      // Al terminar de arrastrar el marcador
      if (property._id === this.editingMarkerId) {
        property.location.coordinates = [
          event.target._latlng.lat,
          event.target._latlng.lng
        ];
      }
    },
    initMap() {
      // Inicializa el mapa y centra según usuario/propiedades
      this.calculateCenter();
    },
    calculateCenter() {
      // Calcula el centro del mapa
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            this.userLocation = [lat, lng];
            if (this.$refs.map && this.$refs.map.leafletObject) {
              this.$refs.map.leafletObject.setView(this.userLocation, 12);
            }
            this.center = this.userLocation;
            this.zoom = 12;
          },
          (error) => {
            console.error("Error al obtener la ubicación:", error.message);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        if (this.properties.length > 0) {
          let avgLat = 0;
          let avgLng = 0;
          this.properties.forEach(property => {
            avgLat += property.location.coordinates[0];
            avgLng += property.location.coordinates[1];
          });
          this.center = [
            avgLat / this.properties.length,
            avgLng / this.properties.length
          ];
        }
      }
    },
    async geocodeAddress(address) {
      // Geocodifica una dirección usando Google Maps API
      const apiKey = "AIzaSyDVqiKUgpSq-3M_XV2Ln4D3gh-_Zgv8ZVQ";
      const addressParam = `${address.street} ${address.number}, ${address.municipality}`;
      const componentsParam = `locality:${encodeURIComponent(address.city)}|postal_code:${encodeURIComponent(address.postalCode)}|country:${encodeURIComponent(address.country)}`;
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressParam)}&components=${componentsParam}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === "OK" && data.results[0]) {
          return [
            data.results[0].geometry.location.lat,
            data.results[0].geometry.location.lng
          ];
        }
        return null;
      } catch (error) {
        console.error("Error en geocodificación:", error);
        return null;
      }
    },
    async calculateCoordinates(property) {
      // Calcula coordenadas a partir de la dirección
      const coords = await this.geocodeAddress(property.address);
      if (coords) {
        property.location.coordinates = [...coords];
      } else {
        alert("No se pudo encontrar la ubicación");
      }
    },
    getScreenHeight() {
      // Actualiza la altura de pantalla
      this.screenHeight = window.innerHeight;
    },

    // =======================
    // USUARIOS
    // =======================
    async retrieveUsers() {
      // Recupera la lista de usuarios anfitriones
      if (this.isHostAdmin) {
        try {
          const response = await PropertyService.getUserlist('user');
          for (const user of response.data) {
            const userData = await this.getOnlyHostUsers(user.id);
            if (userData !== null) {
              this.users.push(userData);
            }
          }
        } catch (error) {
          console.error("Error al obtener usuarios:", error);
        }
      }
    },
    async getOnlyHostUsers(id) {
      // Obtiene usuarios que son anfitriones
      if (this.isHostAdmin) {
        const dataUser = await UserService.getUser(id);
        if (dataUser.data.info.isHost) {
          return {
            id: dataUser.data._id,
            name: dataUser.data.info.name,
            email: dataUser.data.info.email
          };
        } else {
          return null;
        }
      }
      return null;
    },

    // =======================
    // BUSQUEDA DE PROPIEDADES
    // =======================
    async searchProperties() {
      // Busca propiedades por filtros
      try {
        const filters = {};
        const fields = ['title', 'city', 'country', 'maxGuests', 'bedrooms', 'bathrooms'];
        fields.forEach(field => {
          if (this.search[field] && this.search[field] !== '') {
            filters[field] = this.search[field];
          }
        });
        if (this.search.priceMin || this.search.priceMax) {
          const priceRange = [
            this.search.priceMin || 0,
            this.search.priceMax || 999999
          ].join(',');
          filters.pricePerNight = priceRange;
        }
        const response = await PropertyService.getProperties(filters);
        this.properties = response.data;
        this.properties = this.properties.map(p => (Object.assign({}, p, {
          location: p.location || { type: 'Point', coordinates: [,] }
        })));
        this.properties.forEach(async property => {
          await UserService.getDataHost(property.host._id).then(res => {
            property.host = {
              info: {
                name: res.data.name,
                email: res.data.email,
                paypalEmail: res.data.paypalEmail
              }
            }
          });
          property.reviews = this.reviews.filter(review => review.booking.property === property._id);
        });
        this.$refs.searchProperty.closeModal();
      } catch (error) {
        console.error("Error buscando propiedades:", error);
      }
    },
    resetSearch() {
      // Reinicia los filtros de búsqueda
      this.search = {
        title: '',
        city: '',
        country: '',
        priceMin: null,
        priceMax: null,
        maxGuests: null,
        bedrooms: null,
        bathrooms: null,
        host: null
      };
      this.retrieveProperties();
      this.$refs.searchProperty.closeModal();
    },

    // =======================
    // RESERVAS
    // =======================
    async findBookedDates(propertyId) {
      // Recupera las fechas reservadas para una propiedad
      try {
        this.resetRental();
        this.datePickerKey++; // fuerza el rerender visual del date-picker
        const response = await BookingsService.getBookingsByProperty(propertyId)
        this.bookedDates = response.data.map(booking => ({
          start: new Date(booking.checkInDate),
          end: new Date(booking.checkOutDate)
        }))
        this.processDisabledDates()
      } catch (error) {
        console.error('Error cargando reservas:', error)
        this.bookedDates = []
        this.disabledDates = []
      }
    },
    processDisabledDates() {
      // Procesa las fechas reservadas para el DatePicker
      this.disabledDates = this.bookedDates.flatMap(booking => {
        return eachDayOfInterval({
          start: startOfDay(booking.start),
          end: startOfDay(booking.end)
        })
      })
    },
    isDateDisabled(date) {
      // Valida si una fecha está deshabilitada
      return this.disabledDates.some(disabledDate =>
        isSameDay(disabledDate, date))
    },
    formatDate(date, dateFormat = 'dd/MM/yyyy') {
      // Formatea una fecha
      return format(date, dateFormat);
    },
    isSameDayFunc(date1, date2) {
      // Indica si dos fechas son el mismo día
      return isSameDay(date1, date2);
    },
    validateRange() {
      // Valida el rango de fechas seleccionado
      this.rangeError = null
      const range = this.newRental.range
      if (!range.start || !range.end) return
      if (range.start > range.end) {
        ;[range.start, range.end] = [range.end, range.start]
      }
      const selectedDays = eachDayOfInterval(range)
      const conflictedDays = selectedDays.filter(day =>
        this.disabledDates.some(disabled => isSameDay(disabled, day))
      )
      if (conflictedDays.length > 0) {
        this.rangeError = `Fechas no disponibles: ${this.formatDate(conflictedDays[0])}${conflictedDays.length > 1 ? ` + ${conflictedDays.length - 1} días` : ''}`;
        this.newRental.range = { start: null, end: null }
        return
      }
      const isOverlapping = this.bookedDates.some(booking =>
        areIntervalsOverlapping(range, booking)
      )
      if (isOverlapping) {
        this.rangeError = 'El rango seleccionado coincide con una reserva existente'
        this.newRental.range = { start: null, end: null }
      }
    },
    validateNumberOfGuests() {
      // Valida el número de huéspedes seleccionado
      const numberOfGuests = this.newRental.numberOfGuests
      if (numberOfGuests > this.selectedProperty.maxGuests) {
        this.newRental.numberOfGuests = this.selectedProperty.maxGuests
        alert(`El número de huéspedes máximos es ${this.selectedProperty.maxGuests}`)
        return false
      } else if (numberOfGuests < 1) {
        this.newRental.numberOfGuests = 1
        alert('El número de huéspedes no puede ser menor a 1')
        return false
      }
      return true
    },
    validateInfo() {
      // Valida la información de la reserva
      return this.validateNumberOfGuests() && this.validateRange;
    },
    resetRental() {
      // Reinicia el estado de la reserva
      this.newRental = {
        guest: useUsersStore().v_userdata._id,
        propertyId: null,
        range: { start: new Date(), end: new Date() },
        totalPrice: 0,
        status: 'pending',
        payment: null,
        numberOfGuests: 1
      }
      this.rangeError = null
    },

    // =======================
    // PAYPAL
    // =======================
    injectSDKPayPal() {
      // Inyecta el SDK de PayPal en la página
      if (!document.getElementById('paypal-sdk')) {
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.type = 'text/javascript';
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.VUE_APP_PAYPAL_CLIENT_ID}&currency=EUR`;
        script.onload = () => {
          if (this.$refs.paypalModal && this.$refs.paypalModal.isOpen && !this._paypalRendered) {
            this.renderPayPalButtons();
          }
        };
        document.head.appendChild(script);
      }
    },
    openPaypalModalIfValid() {
      // Abre el modal de PayPal si la reserva es válida
      this.newRental.propertyId = this.selectedProperty._id;
      if (this.validateInfo()) {
        this.$refs.rentPropertyModal.closeModal();
        this.$refs.paypalModal.openModal();
        this.renderPayPalButtons();
      }
    },
    renderPayPalButtons() {
      // Renderiza los botones de PayPal
      if (!window.paypal) {
        setTimeout(this.renderPayPalButtons, 200);
        return;
      }
      if (this._paypalRendered) return;
      this._paypalRendered = true;
      const container = document.getElementById('paypal-button-container');
      container.innerHTML = '';
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: this.newRental.totalPrice.toFixed(2) }
            }]
          });
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();
            const capture = details.purchase_units?.[0]?.payments?.captures?.[0];
            const bookingPayload = {
              guest: this.newRental.guest,
              property: this.newRental.propertyId,
              checkInDate: this.newRental.range.start,
              checkOutDate: this.newRental.range.end,
              totalPrice: this.newRental.totalPrice,
              status: 'pending',
              payment: null,
              numberOfGuests: this.newRental.numberOfGuests
            };
            const bookingRes = await BookingsService.createBooking(bookingPayload);
            const bookingId = bookingRes.bookingId;
            const paymentPayload = {
              booking: bookingId,
              amount: capture.amount.value,
              paymentMethod: 'paypal',
              transactionId: capture.id,
              status: capture.status.toLowerCase(),
              paidAt: capture.create_time
            };
            const paymentRes = await PaymentService.createPayment(paymentPayload);
            const paymentId = paymentRes.paymentId;
            await BookingsService.updateBooking(bookingId, { payment: paymentId, status: paymentRes.status });
            this.$refs.paypalModal.closeModal();
            this.resetRental();
            this.resetNewPayment();
            MailerService.sendPaymentConfirmationEmail(useUsersStore().v_userdata?.info, bookingPayload);
          } catch (error) {
            console.error('Error en el flujo de reserva + pago:', error);
            alert('No se pudo completar la reserva y el pago.');
          }
        },
        onInit: function (data, actions) {
          const buttonsContainer = document.querySelector('#paypal-button-container > div');
          if (buttonsContainer) {
            buttonsContainer.classList.add(
              'd-flex',
              'flex-column',
              'justify-content-center',
              'align-items-center',
              'w-100'
            );
            buttonsContainer.style.backgroundColor = 'transparent';
            buttonsContainer.style.padding = '2rem';
            buttonsContainer.style.maxWidth = '700px';
            buttonsContainer.style.margin = '0 auto';
          }
        },
        onError: err => {
          console.error('Error en PayPal:', err);
          alert('Hubo un error al procesar el pago.');
        }
      }).render('#paypal-button-container');
    },
    resetNewPayment() {
      // Reinicia el estado del pago
      this.newPayment = {
        bookingId: null,
        amount: 0,
        paymentMethod: 'paypal',
        transactionId: null,
        status: 'pending',
        paidAt: null
      };
    },
    resetRental() {
      // Reinicia el estado de la reserva y PayPal
      this.newRental = {
        guest: this.newRental.guest,
        propertyId: null,
        range: { start: new Date(), end: new Date() },
        totalPrice: 0,
        status: 'pending',
        payment: null,
        numberOfGuests: 1
      };
      this._paypalRendered = false;
    },

    // =======================
    // AMENITIES
    // =======================
    async loadAmenities() {
      // Carga todos los amenities y categorías
      try {
        const res = await AmenitiesService.getAllAmenities();
        this.allAmenities = res.data.amenities;
        const categories = this.allAmenities.map(a => {
          const cat = a.category || 'Sin categoría';
          return cat.charAt(0).toUpperCase() + cat.slice(1);
        });
        this.amenityCategories = ['Todas', ...Array.from(new Set(categories))];
      } catch (e) {
        console.error("Error cargando amenities", e);
      }
    },
    toggleAmenity(amenityId, propertyKey) {
      // Añade o quita un amenity de la propiedad
      const arr = this[propertyKey].amenities;
      const idx = arr.indexOf(amenityId);
      if (idx === -1) arr.push(amenityId);
      else arr.splice(idx, 1);
    },
  },
};
</script>

<style>
/* =======================
   ESTILOS DE BOTONES FLOTANTES
======================= */
.custom-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
@media (max-width: 768px) {
  .custom-button { bottom: 40px; right: 40px; }
}
@media (max-width: 576px) {
  .custom-button { bottom: 60px; right: 60px; }
}
.custom-button-search {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}
@media (max-width: 768px) {
  .custom-button-search { bottom: 40px; right: 40px; }
}
@media (max-width: 576px) {
  .custom-button-search { bottom: 60px; right: 60px; }
}

/* =======================
   ESTILOS DE MODALES
======================= */
.modal-content {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
.modal-header {
  padding: 1rem 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #222e3c, #3498db);
  color: #fff;
}
.modal-title { letter-spacing: 0.5px; }
.modal-body { padding: 2rem; }
.modal-footer {
  padding: 1rem 2rem;
  border-top: 1px solid #dee2e6;
  gap: 1rem;
  background: linear-gradient(135deg, #222e3c, #3498db);
}
@media (max-width: 768px) {
  .modal-dialog { margin: 1rem; }
  .modal-body { padding: 1.5rem; }
  .display-5 { font-size: 2.5rem; }
}
@media (max-width: 576px) {
  .modal-dialog { margin: 0.5rem; }
  .modal-header { padding: 0.75rem 1rem; }
  .modal-body { padding: 1rem; }
  .display-5 { font-size: 2rem; }
  .modal-footer { flex-wrap: wrap; }
  .modal-footer .btn { width: 100%; margin: 0.25rem 0; }
}
.input-group-text {
  color: #6c757d;
  font-weight: 500;
}

/* =======================
   ESTILOS DE AMENITIES
======================= */
.amenity-btn {
  border: 2px solid #3498db;
  background: #fff;
  color: #3498db;
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}
.amenity-btn.selected,
.amenity-btn:active {
  background: #3498db;
  color: #fff;
  border-color: #2980b9;
}
</style>
