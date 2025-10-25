"""
CursIt HTTP Server - Setup configuration
"""
from setuptools import setup, find_packages

setup(
    name='cursit-server',
    version='0.1.0',
    description='Flask server that integrates with Cursor IDE to open files and paste PR comments',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='Volodymyr Yepishev',
    license='GPL-3.0',
    packages=find_packages(),
    python_requires='>=3.7',
    install_requires=[
        'flask>=2.0.0',
        'pyperclip>=1.8.0',
        'pywin32>=300',
        'python-dotenv>=0.19.0',
    ],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Operating System :: Microsoft :: Windows',
        'Framework :: Flask',
    ],
    keywords='cursor ide flask automation pull-request github azure-devops',
)

