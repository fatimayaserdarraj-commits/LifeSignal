from app.simulator import IncidentSimState


def test_devices_decline_to_zero_eventually():
    state = IncidentSimState(incident_id="sim-test-1", seed_devices=10)
    remaining_history = []
    for _ in range(60):
        snapshot = state.advance()
        remaining_history.append(snapshot["devices_remaining"])
        if snapshot["devices_remaining"] == 0:
            break

    assert remaining_history[-1] == 0
    # Monotonically non-increasing -- occupants never "re-enter" the geofence.
    assert all(a >= b for a, b in zip(remaining_history, remaining_history[1:]))


def test_congestion_stays_in_bounds():
    state = IncidentSimState(incident_id="sim-test-2", seed_devices=20)
    for _ in range(30):
        snapshot = state.advance()
        assert 0.0 <= snapshot["congestion"] <= 1.0


def test_same_incident_id_is_deterministic_shape():
    a = IncidentSimState(incident_id="sim-test-3", seed_devices=5)
    b = IncidentSimState(incident_id="sim-test-3", seed_devices=5)
    seq_a = [a.advance()["devices_remaining"] for _ in range(10)]
    seq_b = [b.advance()["devices_remaining"] for _ in range(10)]
    assert seq_a == seq_b
