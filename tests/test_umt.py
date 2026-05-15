from umt import main


def test_main_prints_welcome(capfd):
    main()
    captured = capfd.readouterr()
    assert "Welcome to UMT!" in captured.out
