package com.y4vra.irboardbackend.domain.model;

public class Associations {
    public static void link(Project p, Functionality f){
        f.setProject(p);
        p._getFunctionalities().add(f);
    }
    public static void unlink(Project p, Functionality f){
        p._getFunctionalities().remove(f);
        f.setProject(null);
    }//TODO generate rest of links
//    public static void link(Journey journey, Vehicle vehicle){
//        journey.setVehicle(vehicle);
//        vehicle._getJourneys().add(journey);
//    }
//    public static void link(Journey journey, Employee employee){
//        journey.setEmployee(employee);
//        employee._getJourneys().add(journey);
//    }
//    public static void link(Journey journey,Refuel refuel){
//        refuel.setJourney(journey);
//        journey._getRefuels().add(refuel);
//    }
//    public static void link(Journey journey,Incidence incidence){
//        incidence.setJourney(journey);
//        journey._getIncidences().add(incidence);
//    }
}
