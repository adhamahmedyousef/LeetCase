"""Build and verify an unpacked Chrome release ZIP; Python standard library only."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent.parent
extension = root / 'extension'
manifest = json.loads((extension / 'manifest.json').read_text(encoding='utf-8'))
version = manifest['version']
assert manifest['manifest_version'] == 3
assert manifest['permissions'] == ['storage']
assert f'<span class="version">{version}</span>' in (extension / 'popup.html').read_text(encoding='utf-8')
assert 'java.js' in manifest['content_scripts'][0]['js']
references = list(manifest['icons'].values()) + [manifest['action']['default_popup']]
for content in manifest['content_scripts']:
    references += content['js'] + content['css']
for reference in references:
    path = (extension / reference).resolve()
    assert path.is_relative_to(extension.resolve()) and path.is_file(), reference

files = {path.relative_to(extension).as_posix(): path.read_bytes() for path in extension.rglob('*') if path.is_file()}
files['LICENSE'] = (root / 'LICENSE').read_bytes()
directory = root / 'dist'
directory.mkdir(exist_ok=True)
archive = directory / f'leetcase-{version}.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for name, data in sorted(files.items()):
        assert name != 'manifest.json' or json.loads(data)['version'] == version
        info = zipfile.ZipInfo(name, (2026, 10, 18, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        bundle.writestr(info, data)
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert set(bundle.namelist()) == set(files)
    assert len(bundle.namelist()) == len(files)
    for name, data in files.items():
        assert bundle.read(name) == data, name
        assert '..' not in Path(name).parts and not Path(name).is_absolute()
    assert 'manifest.json' in bundle.namelist()
    assert not any(name.startswith(('tests/', 'docs/', 'dist/')) for name in bundle.namelist())
result = {'version':version, 'archive':str(archive), 'files':len(files), 'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}
(directory / f'package-{version}.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
print(json.dumps(result))
